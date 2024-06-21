using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using api.Dto;
using api.Models;

namespace api.Mappers
{
    public static  class UserMapper
    {
        public static UserDto ToUserDto(this User user)
        {
            return new UserDto{
                UserID=user.UserID,
                Email=user.Email,
                Name=user.Name,
                Country=user.Country,
                State=user.State,
                City=user.City,
                Telephone=user.Telephone,
                AddressLine1=user.AddressLine1,
                AddressLine2=user.AddressLine2,
                DateOfBirth=user.DateOfBirth,
                SalaryFY2019=user.SalaryFY2019,
                SalaryFY2020=user.SalaryFY2020,
                SalaryFY2021=user.SalaryFY2021,
                SalaryFY2022=user.SalaryFY2022,
                SalaryFY2023=user.SalaryFY2023
            };
        }

     
        public static User ToUserFromUserDto(this CreateUserDto user)
        {
            return new User{

                Email=user.Email,
                Name=user.Name,
                Country=user.Country,
                State=user.State,
                City=user.City,
                Telephone=user.Telephone,
                AddressLine1=user.AddressLine1,
                AddressLine2=user.AddressLine2,
                DateOfBirth=user.DateOfBirth,
                SalaryFY2019=user.SalaryFY2019,
                SalaryFY2020=user.SalaryFY2020,
                SalaryFY2021=user.SalaryFY2021,
                SalaryFY2022=user.SalaryFY2022,
                SalaryFY2023=user.SalaryFY2023
            };
        }
    }

}