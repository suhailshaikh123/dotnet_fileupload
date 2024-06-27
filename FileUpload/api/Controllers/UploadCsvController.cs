using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using api.Data;
using api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;
using Npgsql;
using System.Text;
using RabbitMQ.Client;
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




        [HttpPost("fasterupload")]
        public async Task<IActionResult> uploadCsvFaster(IFormFile file)
        {


            try
            {
                var factory = new ConnectionFactory { HostName = "localhost" };
                using var connection = factory.CreateConnection();
                using var channel = connection.CreateModel();

                channel.QueueDeclare(queue: "process_queue",
                         durable: false,
                         exclusive: false,
                         autoDelete: false,
                         arguments: null);

                

                using var memoryStream = new MemoryStream();
                file.CopyTo(memoryStream);
                var fileBytes = memoryStream.ToArray();
                channel.BasicPublish(exchange: string.Empty,
                                     routingKey: "process_queue",
                                     body: fileBytes);

                return Ok("Data inserted successfully");
            }
            catch
            {
                return BadRequest("Error Occured");
            }
        }
    }
}