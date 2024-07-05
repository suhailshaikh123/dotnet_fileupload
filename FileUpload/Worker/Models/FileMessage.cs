using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;


namespace Worker.Models
{
    public class FileMessage
    {
        public string? FileId { get; set; }
        public byte[] FileContent { get; set; }
    }
}