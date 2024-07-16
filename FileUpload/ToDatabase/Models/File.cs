using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace ToDatabase.Models
{
    public class File
    {
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]

    public string? Id { get; set; }

    [BsonElement("FileId")]
    public string? FileId { get; set; }

    public string FileName { get; set; } = null!;

    public decimal FileSize { get; set; }

    public int TotalBatches {get;set;}

    public string FileStatus { get; set; } = null!;

    public string FileError { get; set; } = null!;

    public List<Batch> Batches { get; set; } = null!;
    }
}