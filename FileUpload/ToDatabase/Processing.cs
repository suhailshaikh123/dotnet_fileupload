using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using log4net;
using log4net.Config;
using Microsoft.AspNetCore.Mvc;
using Npgsql;
using Polly;
using Polly.Retry;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using ToDatabase.Models;
using ToDatabase.Services;

namespace ToDatabase
{
    public class Processing
    {
        ConnectionFactory factory;
        private readonly FileService _fileService;
        [assembly: log4net.Config.XmlConfigurator(Watch = true)]

        private static readonly ILog log = LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);

        public Processing(FileService fileService)
        {
            XmlConfigurator.Configure();
            _fileService = fileService;
            factory = new ConnectionFactory { HostName = "localhost" };
            Start();
        }

        public void Start()
        {
            var connection = factory.CreateConnection();
            var channel = connection.CreateModel();
            channel.QueueDeclare(queue: "database_queue",
                durable: false,
                exclusive: false,
                autoDelete: false,
                arguments: null);

            channel.BasicQos(prefetchSize: 0, prefetchCount: 1, global: false);

            log.Info(" [*] Waiting for Batches To come");

            var consumer = new EventingBasicConsumer(channel);
            List<User> Users;
            var options = new JsonSerializerOptions { WriteIndented = false };
            consumer.Received += async (model, ea) =>
            {
                log.Info("Batch Processing");

                byte[] body = ea.Body.ToArray();
                var message = JsonSerializer.Deserialize<BatchMessage>(body);
                string FileId = message.fileId;
                string BatchId = message.batchId;
                var byteArray = message.Users;

                using (MemoryStream ms = new MemoryStream(byteArray))
                {
                    Users = JsonSerializer.Deserialize<List<User>>(ms, options);
                }

                await InsertToDatabase(Users, FileId, BatchId);
            };
            channel.BasicConsume(queue: "database_queue",
                      autoAck: true,
                      consumer: consumer);
            log.Info(" Press [enter] to exit.");
            Console.ReadLine();
        }

        public async Task<string> InsertToDatabase(List<User> Users, string fileId, string batchId)
        {
            var retryPolicy = Policy
                .Handle<Exception>() // Handle all exceptions
                .WaitAndRetryAsync(6, retryAttempt => 
                    TimeSpan.FromSeconds(Math.Pow(3, retryAttempt)), // Exponential backoff
                    (exception, timeSpan, retryCount, context) =>
                    {
                        log.Error($"Exception occurred. Waiting {timeSpan} before next retry. Retry attempt {retryCount}.", exception);
                    });

            await retryPolicy.ExecuteAsync(async () =>
            {
                await ExecuteDatabaseInsert(Users, fileId, batchId);
            });

            return "Batch inserted successfully";
        }

        private async Task ExecuteDatabaseInsert(List<User> Users, string fileId, string batchId)
        {
            Stopwatch stopWatch = new Stopwatch();
            Stopwatch stop = new Stopwatch();
            stopWatch.Start();
            string connectionString = "Host=localhost;Port=5432;Database=fileupload;Username=postgres;Password=suhail;Include Error Detail=true";
            using (var conn = new NpgsqlConnection(connectionString))
            {
                await conn.OpenAsync();

                using (var cmd = new NpgsqlCommand())
                {
                    cmd.Connection = conn;
                    StringBuilder insertQuery = new StringBuilder("INSERT INTO \"Users\" (\"Email\", \"Name\", \"Country\", \"State\", \"City\", \"Telephone\", \"AddressLine1\", \"AddressLine2\", \"DateOfBirth\", \"SalaryFY2019\", \"SalaryFY2020\", \"SalaryFY2021\", \"SalaryFY2022\", \"SalaryFY2023\") VALUES ");
                    int i = 0;

                    foreach (User user in Users)
                    {
                        insertQuery.Append($"(@Email{i}, @Name{i}, @Country{i}, @State{i}, @City{i}, @Telephone{i}, @AddressLine1{i}, @AddressLine2{i}, @DateOfBirth{i}, @SalaryFY2019{i}, @SalaryFY2020{i}, @SalaryFY2021{i}, @SalaryFY2022{i}, @SalaryFY2023{i}), ");
                        cmd.Parameters.AddWithValue($"@Email{i}", user.Email);
                        cmd.Parameters.AddWithValue($"@Name{i}", user.Name);
                        cmd.Parameters.AddWithValue($"@Country{i}", user.Country);
                        cmd.Parameters.AddWithValue($"@State{i}", user.State);
                        cmd.Parameters.AddWithValue($"@City{i}", user.City);
                        cmd.Parameters.AddWithValue($"@Telephone{i}", user.Telephone);
                        cmd.Parameters.AddWithValue($"@AddressLine1{i}", user.AddressLine1);
                        cmd.Parameters.AddWithValue($"@AddressLine2{i}", user.AddressLine2);
                        cmd.Parameters.AddWithValue($"@DateOfBirth{i}", user.DateOfBirth);
                        cmd.Parameters.AddWithValue($"@SalaryFY2019{i}", user.SalaryFY2019);
                        cmd.Parameters.AddWithValue($"@SalaryFY2020{i}", user.SalaryFY2020);
                        cmd.Parameters.AddWithValue($"@SalaryFY2021{i}", user.SalaryFY2021);
                        cmd.Parameters.AddWithValue($"@SalaryFY2022{i}", user.SalaryFY2022);
                        cmd.Parameters.AddWithValue($"@SalaryFY2023{i}", user.SalaryFY2023);
                        i++;
                    }

                    Batch batch = await _fileService.GetBatchAsync(fileId, batchId);

                    try
                    {
                        string query = insertQuery.ToString().TrimEnd(',', ' ') + " ON CONFLICT DO NOTHING;";
                        cmd.CommandText = query;
                        stop.Start();
                        int rows_affected = await cmd.ExecuteNonQueryAsync();
                        log.Info("Rows Affected: " + rows_affected);
                        stop.Stop();
                        log.Info("Time taken: " + stop.Elapsed);

                        batch.BatchStatus = "Batch Successfully Inserted";
                        stop.Reset();
                        await _fileService.UpdateBatchAsync(fileId, batchId, batch);
                    }
                    catch (Exception e)
                    {
                        log.Error("Error Occured while inserting to database", e);
                        batch.BatchStatus = "Error Occured while inserting to database";
                        batch.ErrorDetails = e.ToString();
                        await _fileService.UpdateBatchAsync(fileId, batchId, batch);
                    }

                    log.Info("Batch Inserted Successfully");
                }
                await conn.CloseAsync();
            }
        }
    }
}
