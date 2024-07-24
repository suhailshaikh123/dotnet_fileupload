using api.Models;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using api.Services;
using Newtonsoft.Json;

namespace api.Services
{
    public class FileService
    {
        private readonly IMongoCollection<Models.File> _filesCollection;
        public FileService(IOptions<FileStateDatabaseSettings> fileStoreDatabaseSettings)
        {
            var mongoClient = new MongoClient(fileStoreDatabaseSettings.Value.ConnectionString);
            var mongoDatabase = mongoClient.GetDatabase(fileStoreDatabaseSettings.Value.DatabaseName);
            _filesCollection = mongoDatabase.GetCollection<Models.File>(
                fileStoreDatabaseSettings.Value.FilesCollectionName
            );


        }
        public async Task<List<Models.File>> GetAsync()
        {
            var result = await _filesCollection.Find(_ => true).ToListAsync();
            return result;
        }

        public async Task<Models.File?> GetAsync(string id)
        {
            var result = await _filesCollection.Find(x => x.FileId == id).FirstOrDefaultAsync();
            return result;
        }
        public async Task CreateAsync(Models.File newFile)
        {

            await _filesCollection.InsertOneAsync(newFile);
        }
        public async Task<dynamic> GetProgress(string id)
        {
            var result = await GetAsync(id);
            if (result == null)
            {
                return new {status = "failed"};
            }

            int totalBatches = result.TotalBatches;
            int successfullyUploadedBatches = result.Batches.Count(batch => batch.BatchStatus == "Batch Successfully Inserted");

            return new{
                status = "success",
                totalBatches = totalBatches,
                successfullyUploadedBatches = successfullyUploadedBatches
            };


        }
        

        // public async Task CreateAsync(Models.File newModels.File) =>
        //     await _filesCollection.InsertOneAsync(newModels.File);

        // public async Task UpdateAsync(string id, Models.File updatedModels.File) =>
        //     await _filesCollection.ReplaceOneAsync(x => x.Id == id, updatedModels.File);

        // public async Task RemoveAsync(string id) =>
        //     await _filesCollection.DeleteOneAsync(x => x.Id == id);
    }
}