graph TD
    %% Define Styles
    classDef timer fill:#f9f,stroke:#333,stroke-width:2px;
    classDef process fill:#e1f5fe,stroke:#0277bd,stroke-width:1px;
    classDef decision fill:#fff9c4,stroke:#fbc02d,stroke-width:1px;
    classDef output fill:#e8f5e9,stroke:#2e7d32,stroke-width:1px,stroke-dasharray: 5 5;
    classDef error fill:#ffcdd2,stroke:#c62828,stroke-width:1px;
    classDef logger fill:#eee,stroke:#999,stroke-width:1px;

    %% --- Start Scheduler Loop ---
    Start([INICIO - Arrancar Script]) --> InitScheduler

    subgraph SchedulerLoop [1. PLANIFICADOR (startScheduler)]
        direction TB
        InitScheduler[RELOJ - Esperar 15 Minutos]:::timer
        RunExecute[Disparar execute()]:::process
        InitScheduler -.->|Cada 15 min| RunExecute
        ExecuteFinished[execute() Finalizado]:::process
        RunExecute --> ExecuteFinished
        ExecuteFinished --> InitScheduler
    end

    %% --- Main Process Flow ---
    RunExecute --> LogicFlow

    subgraph LogicFlow [2. PROCESO PRINCIPAL (execute)]
        direction TB
        
        %% Step 1: Dates
        GetDates[Obtener rango: 7 Días Pasados]:::process
        LoggerFechas(Logger: Registrar fechas):::logger
        GetDates --> LoggerFechas

        %% Step 2: API Loop
        ApiLoopStart[Bucle: Por cada fecha]:::process
        LoggerFechas --> ApiLoopStart
        
        subgraph ApiIteration [Iteración por Día]
            direction LR
            FetchApi[Consultar API GM Transport]:::process
            ApiSuccess{¿Datos obtenidos?}:::decision
            ApiError[Registrar Error en Logger]:::error
            
            FetchApi --> ApiSuccess
            ApiSuccess -->|Sí| AddRows[Acumular Viajes]:::process
            ApiSuccess -->|No/Error| ApiError
        end
        
        ApiLoopStart --> FetchApi
        AddRows --> ApiLoopEnd
        ApiError --> ApiLoopEnd
        ApiLoopEnd[Fin del bucle]:::process
        
        %% Step 3: Guard 1 - No API Data
        CheckRows{¿Hay datos acumulados?}:::decision
        LoggerNoApi(Logger: 'Ciclo Abortado'):::logger
        
        ApiLoopEnd --> CheckRows
        CheckRows -->|No| LoggerNoApi
        LoggerNoApi --> FinishExecute[Terminar execute()]
        
        %% Step 4: Filters
        ApplyFilters[Aplicar Filtros: Cliente 402 + Lógica Status]:::process
        SortRows[Ordenar por Salida (Desc)]:::process
        
        CheckRows -->|Sí| ApplyFilters
        ApplyFilters --> SortRows
    end

    %% --- Step 5: Guard 2 - No Filtered Data ---
    CheckFiltered{¿Hay datos filtrados?}:::decision
    LoggerNoFilter(Logger: 'Nada que enviar'):::logger
    
    SortRows --> CheckFiltered
    CheckFiltered -->|No| LoggerNoFilter
    LoggerNoFilter --> FinishExecute

    %% --- Output Stage ---
    CheckFiltered -->|Sí| OutputFlow

    subgraph OutputFlow [3. GENERACIÓN DE SALIDA]
        direction TB
        CreateExcel[Crear Archivo Excel]:::process
        CheckExcel{¿Excel creado?}:::decision
        LoggerExcelError(Logger: Error en Creación):::error
        
        CreateExcel --> CheckExcel
        CheckExcel -->|No| LoggerExcelError
        LoggerExcelError --> FinishExecute
        
        %% Success Path
        SendEmail[Enviar Email con Adjunto]:::output
        LoggerEmailSuccess(Logger: 'Email Enviado'):::logger
        UnlinkFile[Eliminar Archivo Temporal]:::output
        LoggerFileDeleted(Logger: 'Archivo Borrado'):::logger
        
        CheckExcel -->|Sí| SendEmail
        SendEmail --> LoggerEmailSuccess
        LoggerEmailSuccess --> UnlinkFile
        UnlinkFile --> LoggerFileDeleted
        LoggerFileDeleted --> FinishExecute
    end
    
    FinishExecute --> ExecuteFinished

    %% Link to external Logger file
    subgraph LoggerStorage [Almacenamiento Local]
        LogFile[(sync-YYYY-MM-DD.log)]:::logger
    end
    
    LoggerFechas -.-> LogFile
    ApiError -.-> LogFile
    LoggerNoApi -.-> LogFile
    LoggerNoFilter -.-> LogFile
    LoggerExcelError -.-> LogFile
    LoggerEmailSuccess -.-> LogFile
    LoggerFileDeleted -.-> LogFile
