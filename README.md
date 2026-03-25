``` mermaid
graph TD
    %% Define Styles
    classDef timer fill:#f9f,stroke:#333,stroke-width:2px;
    classDef process fill:#e1f5fe,stroke:#0277bd,stroke-width:1px;
    classDef decision fill:#fff9c4,stroke:#fbc02d,stroke-width:1px;
    classDef output fill:#e8f5e9,stroke:#2e7d32,stroke-width:1px,stroke-dasharray: 5 5;
    classDef error fill:#ffcdd2,stroke:#c62828,stroke-width:1px;
    classDef logger fill:#eee,stroke:#999,stroke-width:1px;

    %% --- Start Scheduler Loop ---
    Start(["INICIO - Arrancar Script"]) --> InitScheduler

    subgraph SchedulerLoop ["1. PLANIFICADOR (startScheduler)"]
        direction TB
        InitScheduler["RELOJ - Esperar 15 Minutos"]:::timer
        RunExecute["Disparar execute()"]:::process
        InitScheduler -.->|"Cada 15 min"| RunExecute
        ExecuteFinished["execute() Finalizado"]:::process
        RunExecute --> ExecuteFinished
        ExecuteFinished --> InitScheduler
    end

    %% --- Main Process Flow ---
    RunExecute --> LogicFlow

    subgraph LogicFlow ["2. PROCESO PRINCIPAL (execute)"]
        direction TB
        GetDates["Obtener rango: 7 Días Pasados"]:::process
        LoggerFechas("Logger: Registrar fechas"):::logger
        GetDates --> LoggerFechas
        ApiLoopStart["Bucle: Por cada fecha"]:::process
        LoggerFechas --> ApiLoopStart
        
        subgraph ApiIteration ["Iteración por Día"]
            direction LR
            FetchApi["Consultar API GM Transport"]:::process
            ApiSuccess{"¿Datos obtenidos?"}:::decision
            ApiError["Registrar Error en Logger"]:::error
            FetchApi --> ApiSuccess
            ApiSuccess -->|Si| AddRows["Acumular Viajes"]:::process
            ApiSuccess -->|No/Error| ApiError
        end
        
        ApiLoopStart --> FetchApi
        AddRows --> ApiLoopEnd
        ApiError --> ApiLoopEnd
        ApiLoopEnd["Fin del bucle"]:::process
        
        CheckRows{"¿Hay datos acumulados?"}:::decision
        LoggerNoApi("Logger: 'Ciclo Abortado'"):::logger
        ApiLoopEnd --> CheckRows
        CheckRows -->|No| LoggerNoApi
        LoggerNoApi --> FinishExecute["Terminar execute()"]
        
        ApplyFilters["Aplicar Filtros: Cliente 402 + Lógica Status"]:::process
        SortRows["Ordenar por Salida (Desc)"]:::process
        CheckRows -->|Si| ApplyFilters
        ApplyFilters --> SortRows
    end

    SortRows --> CheckFiltered

    subgraph OutputFlow ["3. GENERACIÓN DE SALIDA"]
        direction TB
        CheckFiltered{"¿Hay datos filtrados?"}:::decision
        LoggerNoFilter("Logger: 'Nada que enviar'"):::logger
        CreateExcel["Crear Archivo Excel"]:::process
        CheckExcel{"¿Excel creado?"}:::decision
        LoggerExcelError("Logger: Error en Creación"):::error
        SendEmail["Enviar Email con Adjunto"]:::output
        LoggerEmailSuccess("Logger: 'Email Enviado'"):::logger
        UnlinkFile["Eliminar Archivo Temporal"]:::output
        LoggerFileDeleted("Logger: 'Archivo Borrado'"):::logger
        
        CheckFiltered -->|No| LoggerNoFilter
        LoggerNoFilter --> FinishExecute
        CheckFiltered -->|Si| CreateExcel
        CreateExcel --> CheckExcel
        CheckExcel -->|No| LoggerExcelError
        LoggerExcelError --> FinishExecute
        CheckExcel -->|Si| SendEmail
        SendEmail --> LoggerEmailSuccess
        LoggerEmailSuccess --> UnlinkFile
        UnlinkFile --> LoggerFileDeleted
        LoggerFileDeleted --> FinishExecute
    end
    
    FinishExecute --> ExecuteFinished

    subgraph LoggerStorage ["Almacenamiento Local"]
        LogFile[("sync-YYYY-MM-DD.log")]:::logger
    end
