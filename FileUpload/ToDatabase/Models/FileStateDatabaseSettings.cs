using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ToDatabase.Models
{
    public class FileStateDatabaseSettings
    {
        
    public string ConnectionString { get; set; } = null!;

    public string DatabaseName { get; set; } = null!;

    public string FilesCollectionName { get; set; } = null!;
    }
}