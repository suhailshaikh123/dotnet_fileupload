using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers
{
    [ApiController]
    [Route("FileController")]
    public class FileController: ControllerBase
    {
        private readonly FileService _fileService;

        public FileController(FileService fileService) =>
            _fileService = fileService;

        [HttpGet("GetAll")]
        public async Task<List<Models.File>> Get() {
            var result= await _fileService.GetAsync();
            return result;
        }
        [HttpPost("Create")]
        public async Task<IActionResult> Create(Models.File file)
        {
     
            await _fileService.CreateAsync(file);
            return Ok();
   
        }

        [HttpGet("GetProgresss")]
        public async Task<IActionResult> GetProgress(string id)
        {
            var result = await _fileService.GetProgress(id);
            Console.WriteLine(result);
            if(result.status == "success")
            {
                return Ok(new { message = "success", totalBatches = result.totalBatches, successfullyUploadedBatches = result.successfullyUploadedBatches});
            }
            return Ok(new { message = "failed"});
        }
        [HttpGet("GetById")]
        public async Task<IActionResult> GetById(string id)
        {
            var result = await _fileService.GetAsync(id);
            if(result == null)
            {
                return BadRequest("Not found");
            }
            return Ok(result);
        }

    }
}