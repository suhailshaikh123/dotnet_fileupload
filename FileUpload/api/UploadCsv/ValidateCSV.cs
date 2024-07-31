using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using api.Models;
using System.Text.RegularExpressions;
namespace api.UploadCsv
{
    public class ValidateCSV
    {
        public static bool Validate(User user)
        {



            try
            {
                string? Email = user.Email;
                string? Name = user.Name;
                string? Country = user.Country;
                string? State = user.State;
                string? City = user.City;
                string? Telephone = user.Telephone;
                string? AddressLine1 = user.AddressLine1;
                string? AddressLine2 = user.AddressLine2;

                decimal SalaryFY2019 = Convert.ToDecimal(user.SalaryFY2019);
                decimal SalaryFY2020 = Convert.ToDecimal(user.SalaryFY2020);
                decimal SalaryFY2021 = Convert.ToDecimal(user.SalaryFY2021);
                decimal SalaryFY2022 = Convert.ToDecimal(user.SalaryFY2022);
                decimal SalaryFY2023 = Convert.ToDecimal(user.SalaryFY2023);
                if (IsStringValid(Email, "Email") && IsStringValid(Name, "Name") && IsStringValid(Country, "Country") && IsStringValid(City, "City")
                 && IsStringValid(Telephone, "Telephone") && IsStringValid(AddressLine1, "AddressLine1") &&
                 IsStringValid(AddressLine2, "Address Line 2") && IsSalaryValid(SalaryFY2019, "SalaryFY2019") && IsSalaryValid(SalaryFY2020, "SalaryFy21020") && IsSalaryValid(SalaryFY2021, "SalaryFy21021") && IsSalaryValid(SalaryFY2022, "SalaryFy21022")
                && IsSalaryValid(SalaryFY2023, "SalaryFy21023")
                )
                {
                    return true;
                }
                else
                {
                    return false;
                }


            }
            catch
            {
                Console.WriteLine("Error Occured While validating data;");

            }
            return true;
        }


        public static bool IsSalaryValid(decimal? value, string? fieldName)
        {
            if (value < 0)
            {
                Console.WriteLine(fieldName + "cannot be negative");
                return false;
            }
            else if (value == null)
            {
                Console.WriteLine(fieldName + " cannot be null");
                return false;
            }
            return true;
        }

        public static bool IsStringValid(string? value, string? fieldName)
        {
            Console.WriteLine(fieldName);
            if (String.Equals(fieldName,"Email"))
            {
                Console.WriteLine("hello world");
                return IsValidEmail(value);
            }
            if (string.IsNullOrEmpty(value))
            {
                Console.WriteLine(fieldName + " is empty " + value);
                return false;
            }
            if (value.Length >= 100)
            {
                Console.WriteLine(fieldName + " has length more than 100");
                return false;
            }

            return true;
        }
        public static bool IsValidEmail(string email)
        {
            string emailPattern = @"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$";

            if (string.IsNullOrEmpty(email))
                return false;

            Regex regex = new Regex(emailPattern);
            return regex.IsMatch(email);
        }
    }
}
