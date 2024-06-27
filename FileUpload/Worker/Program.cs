using Worker.Consumer;
namespace hello{
    public class Worker(){
        public static void Main(){
            Processing obj=new Processing();
            obj.Start();
        }
    }
}