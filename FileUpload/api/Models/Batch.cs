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
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? BatchId { get; set; }

        public string BatchStatus { get; set; } = null!;

        public decimal ErrorDetails { get; set; }

        
    }
}