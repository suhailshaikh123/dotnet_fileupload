using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace api.Dto
{
    public class CreateUserDto
    {
        public string ?Email { get; set; }
        public string ?Name { get; set; }
        public string ?Country { get; set; }
        public string ?State { get; set; }
        public string ?City { get; set; }
        public string ?Telephone { get; set; }
        public string ?AddressLine1 { get; set; }
        public string ?AddressLine2 { get; set; }

        public DateTime DateOfBirth { get; set; }

        public decimal SalaryFY2019 { get; set; }
        public decimal SalaryFY2020 { get; set; }
        public decimal SalaryFY2021 { get; set; }
        public decimal SalaryFY2022 { get; set; }
        public decimal SalaryFY2023 { get; set; }
    }
}