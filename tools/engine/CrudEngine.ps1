Set-StrictMode -Version Latest

function Get-SatsetCrudTemplateDefinitions {

    return @(
        @{
            Template = "controller.txt"
            Target   = "{{MODULE}}.controller.ts"
        },
        @{
            Template = "service.txt"
            Target   = "{{MODULE}}.service.ts"
        },
        @{
            Template = "repository.txt"
            Target   = "{{MODULE}}.repository.ts"
        },
        @{
            Template = "dto.txt"
            Target   = "{{MODULE}}.dto.ts"
        },
        @{
            Template = "routes.txt"
            Target   = "{{MODULE}}.routes.ts"
        }
    )
}
