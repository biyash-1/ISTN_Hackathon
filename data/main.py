import googlemaps
import pandas as pd
import time
from dotenv import  load_dotenv
import os
load_dotenv()

# --- CONFIGURATION ---
API_KEY =os.getenv('API_KEY')  # Replace with your actual key
gmaps = googlemaps.Client(key=API_KEY)

# The categories you want to extract
QUERIES = [
    "Hospitals in Kathmandu Valley",
    "Police Stations in Kathmandu Valley",
    "Ambulance Service in Kathmandu Valley"
]

def get_place_details(place_id):
    """
    Fetches contact details (phone, website) for a specific place ID.
    This costs extra but is necessary for phone numbers.
    """
    try:
        # requesting specifically name, phone, and geometry to keep payload small
        details = gmaps.place(
            place_id=place_id, 
            fields=['name', 'formatted_phone_number', 'website', 'geometry', 'formatted_address']
        )
        return details.get('result', {})
    except Exception as e:
        print(f"Error fetching details for {place_id}: {e}")
        return {}

def scrap_category(query):
    print(f"\n--- Starting Scraping for: {query} ---")
    places_data = []
    
    # 1. Search for the query (Text Search)
    results = gmaps.places(query=query)
    
    # Loop to handle pagination (Google allows up to 60 results per query via 3 pages)
    while True:
        for place_summary in results.get('results', []):
            place_id = place_summary.get('place_id')
            
            # 2. Get full details (Phone number is here)
            details = get_place_details(place_id)
            
            # 3. Structure the data
            places_data.append({
                'Category': query.split(' in ')[0], # Extracts 'Hospitals', 'Police', etc.
                'Name': details.get('name'),
                'Phone': details.get('formatted_phone_number', 'N/A'),
                'Address': details.get('formatted_address'),
                'Latitude': details.get('geometry', {}).get('location', {}).get('lat'),
                'Longitude': details.get('geometry', {}).get('location', {}).get('lng'),
                'Website': details.get('website', 'N/A'),
                'Place ID': place_id
            })
            print(f"Fetched: {details.get('name')}")
            
        # Check if there is a next page
        next_token = results.get('next_page_token')
        if not next_token:
            break
            
        # Must sleep for 2 seconds before requesting next page (API requirement)
        time.sleep(2)
        results = gmaps.places(query=query, page_token=next_token)

    return places_data

# --- MAIN EXECUTION ---
all_results = []

for q in QUERIES:
    data = scrap_category(q)
    all_results.extend(data)

# Save to CSV
df = pd.DataFrame(all_results)
df.to_csv('kathmandu_emergency_data.csv', index=False)
print(f"\nDONE! Saved {len(df)} records to kathmandu_emergency_data.csv")