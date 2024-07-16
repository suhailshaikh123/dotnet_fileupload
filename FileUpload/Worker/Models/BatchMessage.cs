using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Worker.Models
{
    public class BatchMessage
    {
        public string fileId { get; set; }
        public string batchId { get; set; }
        public byte[] Users { get; set; }
    }
}