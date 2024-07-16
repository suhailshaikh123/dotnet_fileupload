using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Worker.Models;
using Worker.Services;
using Worker.Consumer;
using log4net;
namespace hello
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
            builder.Services.Configure<FileStateDatabaseSettings>(
            builder.Configuration.GetSection("FileStateDatabase"));

            builder.Services.AddSingleton<FileService>();
            builder.Logging.AddLog4Net();
            var app = builder.Build();
            var fileService = app.Services.GetRequiredService<FileService>();
            Processing obj = new Processing(fileService);



            app.Run();
        }
    }
}
