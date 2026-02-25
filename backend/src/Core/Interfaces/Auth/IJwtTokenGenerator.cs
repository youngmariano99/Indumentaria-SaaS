using System;
using Core.Entities;

namespace Core.Interfaces.Auth;

public interface IJwtTokenGenerator
{
    string GenerateToken(Usuario usuario);
}
