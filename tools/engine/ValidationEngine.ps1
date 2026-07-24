Set-StrictMode -Version Latest

function Test-SatsetMetadata {

    param(
        [Parameter(Mandatory)]
        $Metadata
    )

    if ($null -eq $Metadata) {
        throw "Metadata is null."
    }

    if ($null -eq $Metadata.entity) {
        throw "entity metadata not found."
    }

    if ($null -eq $Metadata.columns) {
        throw "columns metadata not found."
    }

    return $true
}

function Test-SatsetColumns {

    param(
        [Parameter(Mandatory)]
        $Columns
    )

    if ($null -eq $Columns.columns) {
        throw "No columns defined."
    }

    foreach ($Column in @($Columns.columns)) {

        if ([string]::IsNullOrWhiteSpace($Column.name)) {
            throw "Column name cannot be empty."
        }

        if ([string]::IsNullOrWhiteSpace($Column.type)) {
            throw "Column type cannot be empty. ($($Column.name))"
        }
    }

    return $true
}

function Test-SatsetEntity {

    param(
        [Parameter(Mandatory)]
        $Entity
    )

    if ([string]::IsNullOrWhiteSpace($Entity.name)) {
        throw "Entity name cannot be empty."
    }

    return $true
}

function Invoke-SatsetValidation {

    param(
        [Parameter(Mandatory)]
        $Metadata
    )

    Test-SatsetMetadata $Metadata
    Test-SatsetEntity $Metadata.entity
    Test-SatsetColumns $Metadata.columns

    return $true
}
