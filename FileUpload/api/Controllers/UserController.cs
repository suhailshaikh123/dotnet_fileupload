using api.Data;
using api.Dto;
using api.Mappers;
using api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Dapper;
using System.Text;
using api.UploadCsv;
namespace api.Controllers

{
    [Route("api/User")]
    [ApiController]

    public class UserController : ControllerBase
    {
        private readonly ApplicationDBContext _context;
        string connectionString;
        public UserController(ApplicationDBContext context)
        {
            _context = context;
            connectionString = "Host=localhost;Port=5432;Database=fileupload;Username=postgres;Password=suhail";
        }

        [HttpGet("GetAll")]
        public async Task<IActionResult> GetAll()
        {

            NpgsqlConnection conn = new NpgsqlConnection(connectionString);


            conn.Open();
            var cmd = new NpgsqlCommand();
            cmd.Connection = conn;
            string query = $"SELECT * FROM \"Users\" LIMIT 10;";
            // string query="SELECT * FROM \"getAllData\"();";
            List<User> users = (List<User>)await conn.QueryAsync<User>(query);
            Console.WriteLine("reached End");
            conn.Close();
            return Ok(users);
        }


        [HttpGet("id/{id}")]
        public async Task<IActionResult> GetById([FromRoute] int id)
        {
            NpgsqlConnection conn = new NpgsqlConnection(connectionString);
            conn.Open();
            NpgsqlCommand cmd = new NpgsqlCommand();
            cmd.Connection = conn;

            string query = $"SELECT * FROM \"Users\" WHERE \"UserID\" = {id};";
            List<User> users = (List<User>)await conn.QueryAsync<User>(query);
            if (users.Capacity == 0)
            {
                return NotFound();
            }
            conn.Close();
            return Ok(users);
        }

        [HttpGet("Email/{Email}")]
        public async Task<IActionResult> GetByEmail([FromRoute] string Email)
        {
            NpgsqlConnection conn = new NpgsqlConnection(connectionString);
            conn.Open();
            NpgsqlCommand cmd = new NpgsqlCommand();
            cmd.Connection = conn;

            string query = $"SELECT * FROM \"Users\" WHERE \"Email\" = '{Email}';";
            Console.WriteLine(query);
            List<User> users = (List<User>)await conn.QueryAsync<User>(query);
            if (users.Capacity == 0)
            {
                return NotFound();
            }
            conn.Close();
            return Ok(users);
        }


        [HttpPost("Create")]
        public async Task<IActionResult> Create(CreateUserDto user)
        {
            NpgsqlConnection conn = new NpgsqlConnection(connectionString);
            NpgsqlCommand cmd = new NpgsqlCommand();
            conn.Open();
            cmd.Connection = conn;

            var userModel = user.ToUserFromUserDto();
            if(ValidateCSV.Validate(userModel))
            {
                try{
            StringBuilder insertQuery = new StringBuilder($"INSERT INTO \"Users\" (\"Email\", \"Name\", \"Country\", \"State\", \"City\", \"Telephone\", \"AddressLine1\", \"AddressLine2\", \"DateOfBirth\", \"SalaryFY2019\", \"SalaryFY2020\", \"SalaryFY2021\", \"SalaryFY2022\", \"SalaryFY2023\") VALUES (@Email, @Name, @Country, @State, @City, @Telephone, @AddressLine1, @AddressLine2, @DateOfBirth, @SalaryFY2019, @SalaryFY2020, @SalaryFY2021, @SalaryFY2022, @SalaryFY2023) ON CONFLICT (\"Email\") DO UPDATE SET \"Email\"=\"excluded\".\"Email\", \"Name\"=\"excluded\".\"Name\", \"Country\"=\"excluded\".\"Country\", \"State\"=\"excluded\".\"State\", \"City\"=\"excluded\".\"City\", \"Telephone\"=\"excluded\".\"Telephone\", \"AddressLine1\"=\"excluded\".\"AddressLine1\", \"AddressLine2\"=\"excluded\".\"AddressLine2\", \"DateOfBirth\"=\"excluded\".\"DateOfBirth\", \"SalaryFY2019\"=\"excluded\".\"SalaryFY2019\", \"SalaryFY2020\"=\"excluded\".\"SalaryFY2020\", \"SalaryFY2021\"=\"excluded\".\"SalaryFY2021\", \"SalaryFY2022\"=\"excluded\".\"SalaryFY2022\", \"SalaryFY2023\"=\"excluded\".\"SalaryFY2023\";");
            cmd.CommandText = insertQuery.ToString();

            Console.WriteLine(user.SalaryFY2019);
            cmd.Parameters.AddWithValue($"@Email", user.Email);
            cmd.Parameters.AddWithValue($"@Name", user.Name);
            cmd.Parameters.AddWithValue($"@Country", user.Country);
            cmd.Parameters.AddWithValue($"@State", user.State);
            cmd.Parameters.AddWithValue($"@City", user.City);
            cmd.Parameters.AddWithValue($"@Telephone", user.Telephone);
            cmd.Parameters.AddWithValue($"@AddressLine1", user.AddressLine1);
            cmd.Parameters.AddWithValue($"@AddressLine2", user.AddressLine2);
            cmd.Parameters.AddWithValue($"@DateOfBirth", user.DateOfBirth);
            cmd.Parameters.AddWithValue($"@SalaryFY2019", user.SalaryFY2019);
            cmd.Parameters.AddWithValue($"@SalaryFY2020", user.SalaryFY2020);
            cmd.Parameters.AddWithValue($"@SalaryFY2021", user.SalaryFY2021);
            cmd.Parameters.AddWithValue($"@SalaryFY2022", user.SalaryFY2022);
            cmd.Parameters.AddWithValue($"@SalaryFY2023", user.SalaryFY2023);

            Console.WriteLine(cmd.CommandText);
            Console.WriteLine("Rows Affected: " + await cmd.ExecuteNonQueryAsync());
            return CreatedAtAction(nameof(GetById), new { id = userModel.UserID }, userModel.ToUserDto());
                }
                catch{
                    Console.WriteLine(user.SalaryFY2019);
                    return BadRequest();
                }
                finally{
                    
                }
            }
            else{
                return BadRequest("Data is Not valid");
            }
        }

        [HttpGet("Delete/{id}")]
        public async Task<IActionResult> Delete([FromRoute] int id)
        {
            NpgsqlConnection conn = new NpgsqlConnection(connectionString);
            NpgsqlCommand cmd = new NpgsqlCommand();
            conn.Open();
            cmd.Connection = conn;
            string query=$"Delete from \"Users\" where \"UserID\"={id}";
            Console.WriteLine(query);
            cmd.CommandText = query;
            Console.WriteLine("Rows Affected: " + await cmd.ExecuteNonQueryAsync());
            return Ok("Successfully Deleted");
        }

               [HttpGet("DeleteByMail/{Email}")]
        public async Task<IActionResult> Delete([FromRoute] string Email)
        {
            NpgsqlConnection conn = new NpgsqlConnection(connectionString);
            NpgsqlCommand cmd = new NpgsqlCommand();
            conn.Open();
            cmd.Connection = conn;
            string query=$"Delete from \"Users\" where \"Email\"='{Email}'";
            Console.WriteLine(query);
            cmd.CommandText = query;
            int rows_affected = await cmd.ExecuteNonQueryAsync();
            if(rows_affected==0)
            return NotFound();
         
            return Ok("Successfully Deleted");
        }
    }




}