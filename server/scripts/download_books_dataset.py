#!/usr/bin/env python3
"""
scripts/download_books_dataset.py
Downloads the Kaggle "7k books with metadata" dataset (books.csv) into
server/data/books.csv using kagglehub.

Usage:
  pip install kagglehub pandas
  python scripts/download_books_dataset.py
"""
import pathlib

import kagglehub
from kagglehub import KaggleDatasetAdapter

OUT_PATH = pathlib.Path(__file__).resolve().parent.parent / "data" / "books.csv"

def main():
    df = kagglehub.load_dataset(
        KaggleDatasetAdapter.PANDAS,
        "dylanjcastillo/7k-books-with-metadata",
        "books.csv",
    )
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(OUT_PATH, index=False)
    print(f"Downloaded {len(df)} books -> {OUT_PATH}")

if __name__ == "__main__":
    main()
