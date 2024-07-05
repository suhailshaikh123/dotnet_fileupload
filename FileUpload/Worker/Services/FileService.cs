using Worker.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;


namespace Worker.Services
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

        public async Task UpdateAsync(string fileId, Models.File newFile)
        {
            var filter = Builders<Models.File>.Filter.Eq(f => f.FileId, fileId);
            var update = Builders<Models.File>.Update
                .Set(f => f.FileName, newFile.FileName)
                .Set(f => f.FileSize, newFile.FileSize)
                .Set(f => f.FileStatus, newFile.FileStatus)
                .Set(f => f.FileError, newFile.FileError)
                .Set(f => f.TotalBatches, newFile.TotalBatches);

            await _filesCollection.UpdateOneAsync(filter, update);
        }

        public async Task AddBatchAsync( string fileId, Batch batch)
        {
            try
            {
                var filter = Builders<Models.File>.Filter.Eq(s => s.FileId, fileId);
                             
                var update = Builders<Models.File>.Update.Push(s => s.Batches, batch);

                var result = await _filesCollection.UpdateOneAsync(filter, update);


            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message);
            }
        }


    }
}