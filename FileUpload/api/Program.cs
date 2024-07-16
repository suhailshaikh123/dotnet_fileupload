using api.Data;
using Microsoft.EntityFrameworkCore;
using api.Models;
using api.Services;
using log4net;
using Microsoft.Extensions.Logging;
using log4net;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


builder.Services.AddDbContext<ApplicationDBContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
});

builder.Services.AddControllers().AddNewtonsoftJson(options =>
{
    options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
});
builder.Services.Configure<FileStateDatabaseSettings>(
    builder.Configuration.GetSection("FileStateDatabase"));

builder.Services.AddSingleton<FileService>();
builder.Logging.AddLog4Net();
// builder.Services.AddSingleton<>();
var app = builder.Build();
app.UseCors(builder => builder
       .AllowAnyHeader()
       .AllowAnyMethod()
       .AllowAnyOrigin()
    );

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapControllers();


app.Run();
