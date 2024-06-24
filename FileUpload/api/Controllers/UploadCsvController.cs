using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using api.Data;
using api.Models;
using Microsoft.AspNetCore.Mvc;
using api.UploadCsv;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;
using Npgsql;
namespace api.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class UploadCsvController : ControllerBase
    {

        private readonly ApplicationDBContext _context;
        public UploadCsvController(ApplicationDBContext context)
        {
            _context = context;
        }

        [HttpPost("upload")]
        public async Task<IActionResult> uploadCsv(IFormFile file)
        {
            List<User> userToUpload = new List<User>();
            bool isFirstLine = true;
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            // Read the file content line by line
            Stopwatch stopWatch = new Stopwatch();
            stopWatch.Start();
            using (StreamReader reader = new StreamReader(file.OpenReadStream(), Encoding.UTF8))
            {

                while (!reader.EndOfStream)
                {

                    if (isFirstLine)
                    {
                        isFirstLine = false;
                        continue;
                    }
                    var line = await reader.ReadLineAsync();
                    var fields = line.Split(",");
                    //  Console.WriteLine("[{0}]", string.Join(", ", fields));
                    if (DateTime.TryParseExact(fields[8], "yyyy-MM-dd", null, System.Globalization.DateTimeStyles.None, out DateTime dateOfBirth))
                    {
                        try
                        {
                            User user = fields.ConvertToUser();
                            userToUpload.Add(user);
                        }
                        catch
                        {
                            // Console.WriteLine(fields[9].ToString());
                        }


                    }

                }
            }
            await _context.BulkInsertAsync(userToUpload);
            // await _context.Database.ExecuteSqlAsync($"Insert into Users Values {userToUpload};");
            await _context.SaveChangesAsync();
            stopWatch.Stop();
            TimeSpan ts = stopWatch.Elapsed;
            Console.WriteLine(ts);
            return Ok("csv file uploaded and processed successfully.");
        }



        [HttpPost("fasterupload")]
        public async Task<IActionResult> uploadCsvFaster(IFormFile file)
        {
            List<User> userToUpload = new List<User>();
            bool isFirstLine = true;
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            Stopwatch stopWatch = new Stopwatch();
            Stopwatch stop = new Stopwatch();
            stopWatch.Start();
            string connectionString = "Host=localhost;Port=5432;Database=fileupload;Username=postgres;Password=suhail";
            using (StreamReader reader = new StreamReader(file.OpenReadStream(), Encoding.UTF8))
            {

                using (var conn = new NpgsqlConnection(connectionString))
                {

                    conn.Open();


                    using (var cmd = new NpgsqlCommand())
                    {   
                        cmd.Connection = conn;

                        StringBuilder insertQuery = new StringBuilder("INSERT INTO \"Users\" (\"Email\", \"Name\", \"Country\", \"State\", \"City\", \"Telephone\", \"AddressLine1\", \"AddressLine2\", \"DateOfBirth\", \"SalaryFY2019\", \"SalaryFY2020\", \"SalaryFY2021\", \"SalaryFY2022\", \"SalaryFY2023\") VALUES ");
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
                                    cmd.Parameters.AddWithValue($"@DateOfBirth{i}", dateOfBirth);
                                    cmd.Parameters.AddWithValue($"@SalaryFY2019{i}", user.SalaryFY2019);
                                    cmd.Parameters.AddWithValue($"@SalaryFY2020{i}", user.SalaryFY2020);
                                    cmd.Parameters.AddWithValue($"@SalaryFY2021{i}", user.SalaryFY2021);
                                    cmd.Parameters.AddWithValue($"@SalaryFY2022{i}", user.SalaryFY2022);
                                    cmd.Parameters.AddWithValue($"@SalaryFY2023{i}", user.SalaryFY2023);
                                    userToUpload.Add(user);
                                }
                                catch
                                {
                                    // Console.WriteLine(fields[9].ToString());
                                }
                            }

                            i++;

                            // Execute the command and clear the parameters after every 1000 rows
                            if (i % chunkSize == 0)
                            {
                                string query = insertQuery.ToString().Substring(0, insertQuery.Length - 2);
                                query = query + " ON CONFLICT DO NOTHING;"; 
                                cmd.CommandText = query;
                                stop.Start();
                                Console.WriteLine("Rows Affected: " +cmd.ExecuteNonQuery());
                                stop.Stop();
                                Console.WriteLine("Time taken: "+stop.Elapsed);
                                stop.Reset();
                                // Clear the command 0parameters and the insert query
                                cmd.Parameters.Clear();
                                insertQuery.Clear();

                                insertQuery.Append("INSERT INTO \"Users\" (\"Email\", \"Name\", \"Country\", \"State\", \"City\", \"Telephone\", \"AddressLine1\", \"AddressLine2\", \"DateOfBirth\", \"SalaryFY2019\", \"SalaryFY2020\", \"SalaryFY2021\", \"SalaryFY2022\", \"SalaryFY2023\") VALUES ");


                            }
                        }

                        // Execute the remaining command
                        if (i % chunkSize != 0)
                        {
                            string query = insertQuery.ToString().Substring(0, insertQuery.Length - 2);
                            query = query + " ON CONFLICT DO NOTHING;";
                            cmd.CommandText = query;
                            stop.Start();
                            await cmd.ExecuteNonQueryAsync();
                            stop.Stop();
                            stop.Reset();
                            Console.WriteLine(stop.Elapsed);
                        }

                    }
                    conn.Close();
                }
            }
            stopWatch.Stop();
            Console.WriteLine(stopWatch.Elapsed);

            Console.WriteLine("Data inserted successfully!");
            return Ok("Data inserted successfully!");
        }
    }
}