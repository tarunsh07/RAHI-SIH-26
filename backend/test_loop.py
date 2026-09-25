import math

BETA_PENALTY = 8.0
battery_capacity_kwh = 900.0
charger_power_kw = 120.0
target_soc = 0.90
soc = 0.05
total_minutes = 0.0

while soc < target_soc:
    if soc <= 0.80:
        charge_power = charger_power_kw
    else:
        charge_power = charger_power_kw * math.exp(-BETA_PENALTY * (soc - 0.80))
    
    energy_added = charge_power * (1.0 / 60.0)
    soc += energy_added / battery_capacity_kwh
    total_minutes += 1.0

print(f"Done. Minutes: {total_minutes}, final soc: {soc}")
