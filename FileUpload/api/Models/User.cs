using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace api.Models
{
     public class User
    {
        [Key]
        public int UserID { get; set; }

        [Required]
        [MaxLength(255)] // Adjust the length as needed
        public string ?Email { get; set; }

        [Required]
        [MaxLength(100)] // Adjust the length as needed
        public string ?Name { get; set; }

        [MaxLength(100)] // Adjust the length as needed
        public string ?Country { get; set; }

        [MaxLength(100)] // Adjust the length as needed
        public string ?State { get; set; }

        [MaxLength(100)] // Adjust the length as needed
        public string ?City { get; set; }

        // Adjust the length as needed
        public string ?Telephone { get; set; }

        [MaxLength(255)] // Adjust the length as needed
        public string ?AddressLine1 { get; set; }

        [MaxLength(255)] // Adjust the length as needed
        public string ?AddressLine2 { get; set; }

        public DateTime DateOfBirth { get; set; }

        public decimal SalaryFY2019 { get; set; }
        public decimal SalaryFY2020 { get; set; }
        public decimal SalaryFY2021 { get; set; }
        public decimal SalaryFY2022 { get; set; }
        public decimal SalaryFY2023 { get; set; }
    }
    
}