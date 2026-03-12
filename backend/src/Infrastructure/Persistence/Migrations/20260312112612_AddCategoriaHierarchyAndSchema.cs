using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddCategoriaHierarchyAndSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "EsquemaAtributosJson",
                table: "Categorias",
                type: "jsonb",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Categorias_ParentId",
                table: "Categorias",
                column: "ParentId");

            migrationBuilder.AddForeignKey(
                name: "FK_Categorias_Categorias_ParentId",
                table: "Categorias",
                column: "ParentId",
                principalTable: "Categorias",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Categorias_Categorias_ParentId",
                table: "Categorias");

            migrationBuilder.DropIndex(
                name: "IX_Categorias_ParentId",
                table: "Categorias");

            migrationBuilder.DropColumn(
                name: "EsquemaAtributosJson",
                table: "Categorias");
        }
    }
}
