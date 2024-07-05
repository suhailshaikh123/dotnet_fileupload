using api.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;


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

        // public async Task CreateAsync(Models.File newModels.File) =>
        //     await _filesCollection.InsertOneAsync(newModels.File);

        // public async Task UpdateAsync(string id, Models.File updatedModels.File) =>
        //     await _filesCollection.ReplaceOneAsync(x => x.Id == id, updatedModels.File);

        // public async Task RemoveAsync(string id) =>
        //     await _filesCollection.DeleteOneAsync(x => x.Id == id);
    }
}