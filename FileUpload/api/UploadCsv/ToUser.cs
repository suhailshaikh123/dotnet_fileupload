using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using api.Models;

namespace api.UploadCsv
{
    public static class ToUser
    {
        public static User ConvertToUser(this string []fields)
        {
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
    }
}