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

namespace Worker.Consumer
{
    public class Processing
    {
        ConnectionFactory factory;
        public Processing()
        {
            factory = new ConnectionFactory { HostName = "localhost" };
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
                        var fileBytes = ea.Body.ToArray();

                        using MemoryStream memoryStream = new MemoryStream(fileBytes);
                        using StreamReader reader = new StreamReader(memoryStream, Encoding.UTF8);
                        await ParseFile(reader);
                        // channel.BasicAck(deliveryTag:ea.DeliveryTag,multiple:false);

                    };
            channel.BasicConsume(queue: "process_queue",
                      autoAck: true,
                      consumer: consumer);
            Console.WriteLine(" Press [enter] to exit.");
            Console.ReadLine();
        }
        public async Task<string> ParseFile(StreamReader reader)
        {
            List<User> userToUpload = new List<User>();
            bool isFirstLine = true;



            int i = 0;
            int chunkSize = 4600;

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
                    AddToQueue(temp);
                    // Clear the command 0parameters and the insert query
                    userToUpload.Clear();

                }
            }

            // Execute the remaining command
            if (i % chunkSize != 0)
            {
                List<User> temp = new List<User>(userToUpload);
                AddToQueue(temp);

            }



            return "hello";
        }

        public static void AddToQueue(List<User> userToUpload)
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