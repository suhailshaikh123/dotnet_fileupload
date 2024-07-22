using System.Text;
using api.Data;
using api.Models;
using Microsoft.AspNetCore.Mvc;
using RabbitMQ.Client;
using System.Text.Json;
using MongoDB.Bson.IO;
using Newtonsoft.Json;
using api.Services;
using log4net;
using log4net.Config;

[assembly: log4net.Config.XmlConfigurator(Watch = true)]
namespace api.Controllers
{
    [Route("[controller]")]
    [ApiController]
    
    public class UploadCsvController : ControllerBase
    {

        private readonly ApplicationDBContext _context;
        private readonly FileService _fileService;
       
         
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
       
        

        public UploadCsvController(ApplicationDBContext context,FileService fileService)
        {
            XmlConfigurator.Configure();
            _context = context;
            _fileService = fileService;
        }   




        [HttpPost("fasterupload")]
        public async Task<IActionResult> uploadCsvFaster(IFormFile file)
        {

            log.Info($"Received file: {file.FileName}");
                Models.File fileToInsert=new Models.File{
                    Id="",
                    FileId=Guid.NewGuid().ToString(),
                    FileName=file.FileName,
                    FileSize=file.Length,
                    TotalBatches=0,
                    FileStatus="Pending",
                    FileError="",
                    Batches=new List<Batch>()
                };
               try{
              
                await _fileService.CreateAsync(fileToInsert);
               }
               catch(Exception e){
                log.Error("Failed to store state of file "+e.ToString());
                return Ok("Failed to store state of file "+e.ToString());
               }
               
                string json = Newtonsoft.Json.JsonConvert.SerializeObject(fileToInsert, Formatting.Indented);
                log.Info(json);
            
                
                var factory = new ConnectionFactory { HostName = "localhost" };
                using var connection = factory.CreateConnection();
                using var channel = connection.CreateModel();

                channel.QueueDeclare(queue: "process_queue",
                         durable: false,
                         exclusive: false,
                         autoDelete: false,
                         arguments: null);



                using var memoryStream = new MemoryStream();
                file?.CopyTo(memoryStream);
                var fileBytes = memoryStream.ToArray();

                var data = new FileMessage
                {
                    FileId = fileToInsert.FileId,
                    FileContent = fileBytes
                };
                // log.Info(fileBytes);
                var message = System.Text.Json.JsonSerializer.Serialize(data);
                var mes = Encoding.UTF8.GetBytes(message);
                channel.BasicPublish(exchange: string.Empty,
                                     routingKey: "process_queue",
                                     body: mes);
                
            
                return Ok(new {msg = "data inserted successfully" , fileId = fileToInsert.FileId});
               }
            
            
           
        }
    }
