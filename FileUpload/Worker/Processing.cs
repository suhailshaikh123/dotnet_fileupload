using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Text;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using Npgsql;
using Worker.UploadCsv;
using System.Diagnostics;
using Worker.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http.HttpResults;
using System.IO;
using System.Text.Json;
using Worker.Services;

namespace Worker.Consumer
{
    public class Processing
    {
        ConnectionFactory factory;
        private readonly FileService _fileService;
        public Processing(FileService fileService)
        {
            _fileService = fileService;
            factory = new ConnectionFactory { HostName = "localhost" };
            Start();
        }
        public void Start()
        {
            var connection = factory.CreateConnection();
            var channel = connection.CreateModel();
            channel.QueueDeclare(queue: "process_queue",
                durable: false,
                exclusive: false,
                autoDelete: false,
                arguments: null);

            channel.BasicQos(prefetchSize: 0, prefetchCount: 1, global: false);

            Console.WriteLine(" [*] Waiting for file to Come");


            var consumer = new EventingBasicConsumer(channel);
            consumer.Received += async (model, ea) =>
                    {
                        Console.WriteLine("File Processing");
                        byte[] body = ea.Body.ToArray();
                        var message = JsonSerializer.Deserialize<FileMessage>(body);
                        var fileId = message.FileId;
                        var fileBytes = message.FileContent;

                        try
                        {
                            //updating Status of a File.
                            Models.File result = await _fileService.GetAsync(fileId);
                            result.FileStatus = "Processing file about to Start";
                            await _fileService.UpdateAsync(fileId, result);


                            Console.WriteLine("Result from File State: " + result);
                        }
                        catch (Exception e)
                        {
                            Console.WriteLine("Error occured While Updating State of file" + e);
                        }


                        Console.WriteLine($"Processing file {fileId}");
                        using MemoryStream memoryStream = new MemoryStream(fileBytes);
                        using StreamReader reader = new StreamReader(memoryStream, Encoding.UTF8);
                        await ParseFile(reader, fileId);
                        // channel.BasicAck(deliveryTag:ea.DeliveryTag,multiple:false);

                    };
            channel.BasicConsume(queue: "process_queue",
                      autoAck: true,
                      consumer: consumer);
            Console.WriteLine(" Press [enter] to exit.");
            Console.ReadLine();
        }
        public async Task<string> ParseFile(StreamReader reader, string fileId)
        {
            try
            {
                List<User> userToUpload = new List<User>();
                bool isFirstLine = true;

                Models.File result = await _fileService.GetAsync(fileId);
                result.FileStatus = "File Processing Started";
                await _fileService.UpdateAsync(fileId, result);



                int i = 0;
                int chunkSize = 4600;
                int totalBatches = 0;
                while (!reader.EndOfStream)
                {
                    if (isFirstLine)
                    {
                        isFirstLine = false;
                        continue;
                    }
                    var line = await reader.ReadLineAsync();
                    var fields = line.Split(",");

                    if (DateTime.TryParseExact(fields[8], "yyyy-MM-dd", null, System.Globalization.DateTimeStyles.None, out DateTime dateOfBirth))
                    {
                        try
                        {
                            User user = fields.ConvertToUser();
                            user.DateOfBirth = dateOfBirth;
                            if (ValidateCSV.Validate(user))
                            {
                                userToUpload.Add(user);
                            }
                        }
                        catch
                        {
                            Console.WriteLine("Error occured in processing worker");
                        }
                    }

                    i++;

                    // Execute the command and clear the parameters after every 1000 rows
                    if (i % chunkSize == 0)
                    {
                        List<User> temp = new List<User>(userToUpload);


                        AddToQueue(temp, fileId);
                        Batch batch = new Batch
                        {
                            BatchId = Guid.NewGuid().ToString(),
                            TotalCount = temp.Count,
                            BatchStatus = "Batch is successfully Sent for Uploading"

                        };
                        await _fileService.AddBatchAsync(fileId, batch);
                        // Clear the command 0parameters and the insert query
                        userToUpload.Clear();
                        totalBatches++;

                    }
                }

                // Execute the remaining command
                if (i % chunkSize != 0)
                {
                    List<User> temp = new List<User>(userToUpload);
                    AddToQueue(temp, fileId);
                    Batch batch = new Batch
                    {
                        BatchId = Guid.NewGuid().ToString(),
                        TotalCount = temp.Count,
                        BatchStatus = "Batch is successfully Sent for Uploading"

                    };
                    await _fileService.AddBatchAsync(fileId, batch);
                    // Clear the command 0parameters and the insert query
                    userToUpload.Clear();
                    totalBatches++;
                }


                result = await _fileService.GetAsync(fileId);
                result.FileStatus = "File Processing Finished Successfully";
                result.TotalBatches = totalBatches;
                await _fileService.UpdateAsync(fileId, result);
                return "hello";
            }
            catch
            {
                Models.File result = await _fileService.GetAsync(fileId);
                result.FileStatus = "File Processing Failed Try again";
                await _fileService.UpdateAsync(fileId, result);
                return "Failed";
            }
        }

        public static void AddToQueue(List<User> userToUpload, string fileId)
        {
            var factory = new ConnectionFactory { HostName = "localhost" };
            using var connection = factory.CreateConnection();
            using var channel = connection.CreateModel();

            channel.QueueDeclare(queue: "database_queue",
                     durable: false,
                     exclusive: false,
                     autoDelete: false,
                     arguments: null);

            byte[] byteArray;
            var options = new JsonSerializerOptions { WriteIndented = false };

            using (MemoryStream ms = new MemoryStream())
            {
                JsonSerializer.Serialize(ms, userToUpload, options);
                byteArray = ms.ToArray();
            }




            // Console.WriteLine(fileBytes);
            channel.BasicPublish(exchange: string.Empty,
                                 routingKey: "database_queue",
                                 body: byteArray);
        }


    }
}