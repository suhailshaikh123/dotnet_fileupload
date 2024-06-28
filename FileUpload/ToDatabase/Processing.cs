using System.Linq;
using System.Threading.Tasks;
using System.Text;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using Npgsql;
using System.Diagnostics;
using ToDatabase.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http.HttpResults;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;

namespace ToDatabase
{


    public class Processing
    {
        ConnectionFactory factory;
        public Processing()
        {
            factory = new ConnectionFactory { HostName = "localhost" };
        }
        // factory = new ConnectionFactory { HostName = "localhost" };
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

            Console.WriteLine(" [*] Waiting for Batches To come");


            var consumer = new EventingBasicConsumer(channel);
            List<User> Users;
            var options = new JsonSerializerOptions { WriteIndented = false };
            consumer.Received += async (model, ea) =>
                    {
                        Console.WriteLine("Batch Processing");

                        var byteArray = ea.Body.ToArray();
                        MemoryStream ms = new MemoryStream(byteArray);


                        Users = JsonSerializer.Deserialize<List<User>>(ms, options);

                        InsertToDatabase(Users);
                    };
            channel.BasicConsume(queue: "database_queue",
                      autoAck: true,
                      consumer: consumer);
            Console.WriteLine(" Press [enter] to exit.");
            Console.ReadLine();
        }


        public async Task<string> InsertToDatabase(List<User> Users)
        {
            Stopwatch stopWatch = new Stopwatch();
            Stopwatch stop = new Stopwatch();
            stopWatch.Start();
            string connectionString = "Host=localhost;Port=5432;Database=fileupload;Username=postgres;Password=suhail";
            using (var conn = new NpgsqlConnection(connectionString))
            {

                conn.Open();


                using (var cmd = new NpgsqlCommand())
                {
                    cmd.Connection = conn;

                    StringBuilder insertQuery = new StringBuilder("INSERT INTO \"Users\" (\"Email\", \"Name\", \"Country\", \"State\", \"City\", \"Telephone\", \"AddressLine1\", \"AddressLine2\", \"DateOfBirth\", \"SalaryFY2019\", \"SalaryFY2020\", \"SalaryFY2021\", \"SalaryFY2022\", \"SalaryFY2023\") VALUES ");
                    int i = 0;
                
                    foreach (User user in Users)
                    {


                        try
                        {
                          

                            insertQuery.Append($"(@Email{i}, @Name{i}, @Country{i}, @State{i}, @City{i}, @Telephone{i}, @AddressLine1{i}, @AddressLine2{i}, @DateOfBirth{i}, @SalaryFY2019{i}, @SalaryFY2020{i}, @SalaryFY2021{i}, @SalaryFY2022{i}, @SalaryFY2023{i})");
                            insertQuery.Append(", ");
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
                           

                        }
                        catch
                        {
                            Console.WriteLine("Error Occured while adding Paramaters to Insert Query");
                        }


                        i++;

                        // Execute the command and clear the parameters after every 1000 rows
                    }
                    try{
                    string query = insertQuery.ToString().Substring(0, insertQuery.Length - 2);
                    query = query + " ON CONFLICT DO NOTHING;";
                    cmd.CommandText = query;
                    stop.Start();
                    Console.WriteLine("Rows Affected: " + cmd.ExecuteNonQuery());
                    stop.Stop();
                    Console.WriteLine("Time taken: " + stop.Elapsed);
                    
                    stop.Reset();
                    }
                    catch{
                        Console.WriteLine("Error Occured while inserting to database");
                    }
                    Console.WriteLine("Batch inserted successfully");
                    Console.WriteLine("");

                }
                conn.Close();
            }

           
            return "hello";
        }
    }

}
