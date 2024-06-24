using api.Data;
using api.Dto;
using api.Mappers;
using api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Dapper;
using System.Text;
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

            StringBuilder insertQuery = new StringBuilder($"INSERT INTO \"Users\" (\"Email\", \"Name\", \"Country\", \"State\", \"City\", \"Telephone\", \"AddressLine1\", \"AddressLine2\", \"DateOfBirth\", \"SalaryFY2019\", \"SalaryFY2020\", \"SalaryFY2021\", \"SalaryFY2022\", \"SalaryFY2023\") VALUES (@Email, @Name, @Country, @State, @City, @Telephone, @AddressLine1, @AddressLine2, @DateOfBirth, @SalaryFY2019, @SalaryFY2020, @SalaryFY2021, @SalaryFY2022, @SalaryFY2023) ON CONFLICT DO NOTHING");
            cmd.CommandText = insertQuery.ToString();

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

            Console.WriteLine("Rows Affected: " + await cmd.ExecuteNonQueryAsync());
            return CreatedAtAction(nameof(GetById), new { id = userModel.UserID }, userModel.ToUserDto());
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