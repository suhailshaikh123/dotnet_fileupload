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

    }
}