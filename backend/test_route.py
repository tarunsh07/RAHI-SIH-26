import asyncio
from main import plan_route, RouteRequest

async def test():
    req = RouteRequest(
        start_coords=[28.6139, 77.209],  # Delhi
        end_coords=[25.3176, 82.9739],  # Varanasi
        payload_kg=2000,
        starting_soc=0.65,
        optimization_priority="cost",
        truck_model="Tesla Semi"
    )
    res = await plan_route(req)
    print(f"Number of stops: {len(res.charging_stops)}")
    for s in res.charging_stops:
        print(s)

if __name__ == "__main__":
    asyncio.run(test())
