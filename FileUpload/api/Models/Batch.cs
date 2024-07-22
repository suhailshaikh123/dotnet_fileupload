using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace api.Models
{
    public class Batch
    {
        public string? BatchId { get; set; }

        public int TotalCount { get; set; } = 0;
        public string BatchStatus { get; set; } = null!;

        public string ErrorDetails { get; set; }


    }
}