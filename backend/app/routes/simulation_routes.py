from fastapi import APIRouter, HTTPException
from typing import List
from app.models.schemas import SimulationScenario, SimulationResult, SimulationRunRequest
from app.simulation.scenarios import SIMULATION_SCENARIOS
from app.simulation.runner import run_simulation, run_all_simulations
from app.database import get_db

router = APIRouter(prefix="/simulation", tags=["Attack Simulation"])

@router.get("/scenarios", response_model=List[SimulationScenario])
def list_scenarios():
    return SIMULATION_SCENARIOS

@router.post("/run", response_model=SimulationResult)
def run_single_simulation(req: SimulationRunRequest):
    try:
        return run_simulation(req.scenario_id, protected_mode=req.protected_mode)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/run-all", response_model=List[SimulationResult])
def run_all_tests(protected_mode: bool = True):
    try:
        return run_all_simulations(protected_mode=protected_mode)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history")
def get_simulation_history(limit: int = 50):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT * FROM simulation_runs ORDER BY id DESC LIMIT ?
    """, (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]
