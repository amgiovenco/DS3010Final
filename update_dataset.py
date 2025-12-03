import numpy
import kagglehub
import pandas as pd
import os
import ast

# download latest version
path = kagglehub.dataset_download("lainguyn123/animal-planet")

# find all CSV files in the downloaded directory
csv_files = [f for f in os.listdir(path) if f.endswith(".csv")]

# load first CSV (or loop if multiple)
df = pd.read_csv(os.path.join(path, csv_files[0]))

# function to split range string and return average
def convert_length(value):
    # remove " cm"
    modifier = 1
    if "nan" in str(value):
        return numpy.nan
    if "cm" in value:
        modifier = 0.01
        value = value.replace(" cm", "")
        value = value.replace("cm", "")
    elif "mm" in value:
        modifier = 0.001
        value = value.replace(" mm", "")
        value = value.replace("mm", "")
    elif "m" in value:
        modifier = 1
        value = value.replace(" m", "")
        value = value.replace("m", "")
    else: # no units
        print(f"Could not convert to float: {value}")
        return numpy.nan
    if "-" not in value:
        try:
            return float(value) * modifier
        except ValueError:
            print(f"Could not convert to float: {value}")
            return numpy.nan
    # split by "-"
    try:
        low, high = value.split("--")
    except ValueError:
        low, high = value.split("-")
    try:
        return (float(low) + float(high)) / 2 * modifier
    except ValueError:
        print(f"Could not convert to float: {value}")
        return numpy.nan


# function to split range string and return average
def convert_weight(value):
    modifier = 1
    value = str(value).replace(",", "") # remove commas within numbers
    if "nan" in str(value):
        return numpy.nan
    if "t" in value:
        modifier = 1000
        value = value.replace(" t", "")
        value = value.replace("t", "")
    elif "kg" in value:
        modifier = 1
        value = value.replace(" kg", "")
        value = value.replace("kg", "")
    elif "g" in value:
        modifier = 0.001
        value = value.replace(" g", "")
        value = value.replace("g", "")
    else: # no units
        print(f"Could not convert to float: {value}")
        return numpy.nan
    if "-" not in value:
        try:
            return float(value) * modifier
        except ValueError:
            print(f"Could not convert to float: {value}")
            return numpy.nan
    # split by "-"
    try:
        low, high = value.split("--")
    except ValueError:
        low, high = value.split("-")
    try:
        return (float(low) + float(high)) / 2 * modifier
    except ValueError:
        print(f"Could not convert to float: {value}")
        return numpy.nan


# function to split range string and return average
def convert_speed(value):
    modifier = 1
    value = str(value).replace(",", "") # remove commas within numbers
    if "nan" in str(value):
        return numpy.nan
    if "k/h" in value:
        modifier = 1
        value = value.replace(" k/h", "")
        value = value.replace("k/h", "")
    if "kmh" in value:
        modifier = 1
        value = value.replace(" kmh", "")
        value = value.replace("kmh", "")
    if "km/h" in value:
        modifier = 1
        value = value.replace(" km/h", "")
        value = value.replace("km/h", "")
    elif "m/s" in value:
        modifier = 3.6
        value = value.replace(" m/s", "")
        value = value.replace("m/s", "")
    elif "mph" in value:
        modifier = 1.60934
        value = value.replace(" mph", "")
        value = value.replace("mph", "")
    else: # no units
        print(f"Could not convert to float: {value}")
        return numpy.nan
    if "-" not in value:
        try:
            return float(value) * modifier
        except ValueError:
            print(f"Could not convert to float: {value}")
            return numpy.nan
    # split by "-"
    try:
        low, high = value.split("--")
    except ValueError:
        low, high = value.split("-")
    try:
        return (float(low) + float(high)) / 2 * modifier
    except ValueError:
        print(f"Could not convert to float: {value}")
        return numpy.nan


# function to split range string and return average
def convert_lifespan(value):
    modifier = 1
    value = str(value).replace(",", "") # remove commas within numbers
    if "nan" in str(value):
        return numpy.nan
    if "years" in value:
        modifier = 1
        value = value.replace(" years", "")
        value = value.replace("years", "")
    elif "yrs" in value:
        modifier = 1
        value = value.replace(" yrs", "")
        value = value.replace("yrs", "")
    elif "yr" in value:
        modifier = 1
        value = value.replace(" yr", "")
        value = value.replace("yr", "")
    elif "months" in value:
        modifier = 1/12
        value = value.replace(" months", "")
        value = value.replace("months", "")
    elif "mos" in value:
        modifier = 1/12
        value = value.replace(" mos", "")
        value = value.replace("mos", "")
    else: # no units
        print(f"Could not convert to float: {value}")
        return numpy.nan
    if "-" not in value:
        try:
            return float(value) * modifier
        except ValueError:
            print(f"Could not convert to float: {value}")
            return numpy.nan
    # split by "-"
    try:
        low, high = value.split("--")
    except ValueError:
        low, high = value.split("-")
    try:
        return (float(low) + float(high)) / 2 * modifier
    except ValueError:
        print(f"Could not convert to float: {value}")
        return numpy.nan


# function to split range string and return average
def convert_population(value):
    modifier = 1
    value = str(value).replace(",", "") # remove commas within numbers
    if "nan" in str(value):
        return numpy.nan
    if "Thou" in value:
        modifier = 1000
        value = value.replace(" Thou", "")
        value = value.replace("Thou", "")
    elif "thou" in value:
        modifier = 1000
        value = value.replace(" thou", "")
        value = value.replace("thou", "")
    elif "mln" in value:
        modifier = 1000000
        value = value.replace(" mln", "")
        value = value.replace("mln", "")
    elif "Mln" in value:
        modifier = 1000000
        value = value.replace(" Mln", "")
        value = value.replace("Mln", "")
    elif "M" in value:
        modifier = 1000000
        value = value.replace(" M", "")
        value = value.replace("M", "")
    elif "m" in value:
        modifier = 1000000
        value = value.replace(" m", "")
        value = value.replace("m", "")
    elif "Unknown" in value:
        print(f"Unknown value, setting to nan: {value}")
        return numpy.nan
    if "-" not in value:
        try:
            return float(value) * modifier
        except ValueError:
            print(f"Could not convert to float: {value}")
            return numpy.nan
    # split by "-"
    try:
        low, high = value.split("--")
    except ValueError:
        low, high = value.split("-")
    try:
        return (float(low) + float(high)) / 2 * modifier
    except ValueError:
        print(f"Could not convert to float: {value}")
        return numpy.nan

def convert_population_status(value):
    try:
        psdict = ast.literal_eval(value) # convert string representation of dictionary to actual dictionary
        if 'Population status' in psdict:
            return psdict['Population status']
        else:
            print(f"Population status key not found: {value}")
            return "Unknown"
    except Exception:
        print(f"Could not extract Population status: {value}")
        return "Unknown"


df[['Length']] = df['Length'].apply(lambda x: pd.Series(convert_length(x)))
df[['Height']] = df['Height'].apply(lambda x: pd.Series(convert_length(x)))
df[['Weight']] = df['Weight'].apply(lambda x: pd.Series(convert_weight(x)))
df[['Top speed']] = df['Top speed'].apply(lambda x: pd.Series(convert_speed(x)))
df[['Life span']] = df['Life span'].apply(lambda x: pd.Series(convert_lifespan(x)))
df[['Population size']] = df['Population size'].apply(lambda x: pd.Series(convert_population(x)))
df[['Population']] = df['Population'].apply(lambda x: pd.Series(convert_population_status(x)))

print(df[['Name', 'Population']].head(50))

# unknown values count
print("amount of unknown population statuses: ", df['Population'].value_counts().get('Unknown', 0))

# remove Unknown population status rows
df_cleaned = df[df['Population'] != 'Unknown']

# shape of cleaned dataframe
print("Shape of cleaned dataframe: ", df_cleaned.shape)

# save cleaned dataframe to new CSV
df_cleaned.to_csv("animal_planet_cleaned.csv", index=False)