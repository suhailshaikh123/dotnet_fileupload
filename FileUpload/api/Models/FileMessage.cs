using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace api.Models
{
    public class FileMessage
    {
        public string? FileId { get; set; }
        public IFormFile FileContent { get; set; }
    }
}