using System;

namespace GeneradorHash
{
    class Program
    {
        static void Main(string[] args)
        {
            string password = "123456789";
            string hash = BCrypt.Net.BCrypt.HashPassword(password);
            
            Console.WriteLine("\n=================================================");
            Console.WriteLine("TU NUEVO HASH PARA : " + password);
            Console.WriteLine("=================================================");
            Console.WriteLine(hash);
            Console.WriteLine("=================================================\n");
            
            Console.WriteLine("Copia el hash de arriba y úsalo en este comando SQL:");
            Console.WriteLine("UPDATE \"Usuarios\" SET \"PasswordHash\" = '" + hash + "' WHERE \"Email\" = 'demo@ferreteria.com';");
        }
    }
}
