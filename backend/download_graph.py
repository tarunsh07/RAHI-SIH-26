"""
Graph Downloader — Run Once
===========================
Downloads a driving-network graph for a ~5 km bounding box of central
New Delhi from OpenStreetMap and saves it as ``delhi_drive.graphml`` so
the FastAPI server can load instantly on subsequent starts.

Usage:
    python download_graph.py
"""

import os
import osmnx as ox

# Bounding box: (north, south, east, west)
# Covers India Gate → Connaught Place → Karol Bagh area
NORTH = 28.66
SOUTH = 28.58
EAST = 77.25
WEST = 77.17

OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "delhi_drive.graphml")


def main() -> None:
    print(f"⏳  Downloading driving network for New Delhi bbox …")
    print(f"    N={NORTH}  S={SOUTH}  E={EAST}  W={WEST}")

    G = ox.graph_from_bbox(
        bbox=(NORTH, SOUTH, EAST, WEST),
        network_type="drive",
        simplify=True,
    )

    node_count = G.number_of_nodes()
    edge_count = G.number_of_edges()
    print(f"✅  Graph downloaded: {node_count} nodes, {edge_count} edges")

    ox.save_graphml(G, filepath=OUTPUT_FILE)
    print(f"💾  Saved to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
