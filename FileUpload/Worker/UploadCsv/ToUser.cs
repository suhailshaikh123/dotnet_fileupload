using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Worker.Models;
using Npgsql;

namespace Worker.UploadCsv
{
    public static class ToUser
    {
        public static User ConvertToUser(this string []fields)
        {
            try{
                        User user = new User
                            {
                                Email = fields[0],
                                Name = fields[1],
                                Country = fields[2],
                                State = fields[3],
                                City = fields[4],
                                Telephone = fields[5],
                                AddressLine1 = fields[6],
                                AddressLine2 = fields[7],
                                SalaryFY2019 = Convert.ToDecimal(fields[9]),
                                SalaryFY2020 = Convert.ToDecimal(fields[10]),
                                SalaryFY2021 = Convert.ToDecimal(fields[11]),
                                SalaryFY2022 = Convert.ToDecimal(fields[12]),
                                SalaryFY2023 = Convert.ToDecimal(fields[13])
        
                            };  
                            return user;
            }
            catch{
                Console.WriteLine(fields[9]);
            }
                            return null;
        }
        public static User ConvertToUser(this NpgsqlDataReader reader)
        {
                          User user = new User
                            {
                                Email = reader["UserId"] as string,
                                Name = reader[1]  as string,
                                Country = reader[2] as string,
                                State = reader[3] as string,
                                City = reader[4] as string,
                                Telephone = reader[5] as string,
                                AddressLine1 = reader[6] as string,
                                AddressLine2 = reader[7] as string,
                                SalaryFY2019 = Convert.ToDecimal(reader["SalaryFY2019"]),
                                SalaryFY2020 = Convert.ToDecimal(reader["SalaryFY2020"]),
                                SalaryFY2021 = Convert.ToDecimal(reader["SalaryFY2021"]),
                                SalaryFY2022 = Convert.ToDecimal(reader["SalaryFY2022"]),
                                SalaryFY2023 = Convert.ToDecimal(reader["SalaryFY2023"])

                            };
                            return user;
        }
        
    }
}