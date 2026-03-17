"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Loader2, Search } from "lucide-react";
import Image from "next/image";

export function UnslpashImagePicker({ isOpen, onClose, onSelect }) {
  const [query, setQuery] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchImages = async (searchQuery) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${searchQuery}&per_page=12&client_id=${process.env.NEXT_PUBLIC_UNPLASH_ACCESS_KEY}`
      );
      const data = await response.json();
      setImages(data.results || []);
    } catch (error) {
      console.error("Error fetching images", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchImages(query);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="
          max-w-4xl max-h-[82vh] overflow-hidden flex flex-col gap-0
          rounded-3xl p-0
          border-[oklch(0.87_0.025_85)]
          bg-[oklch(0.99_0.006_80)]
        "
      >
        {/* Header */}
        <DialogHeader className="px-7 pt-7 pb-5 border-b border-[oklch(0.90_0.020_85)] shrink-0">
          <DialogTitle className="font-display text-xl text-[oklch(0.18_0.02_80)]">
            Choose a Cover Image
          </DialogTitle>
          <p className="text-sm text-[oklch(0.55_0.025_80)] font-light -mt-1">
            Search millions of photos from Unsplash
          </p>
        </DialogHeader>

        {/* Search form */}
        <div className="px-7 py-4 shrink-0 border-b border-[oklch(0.90_0.020_85)]">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[oklch(0.60_0.05_150)] pointer-events-none" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search landscapes, concerts, food…"
                className="
                  pl-10 h-10 rounded-full
                  bg-[oklch(0.93_0.018_85)]
                  border-[oklch(0.85_0.025_85)]
                  text-[oklch(0.18_0.02_80)] placeholder:text-[oklch(0.65_0.025_80)] placeholder:font-light
                  focus-visible:ring-1 focus-visible:ring-[oklch(0.55_0.13_152)]
                  focus-visible:border-[oklch(0.75_0.09_150)]
                  text-sm transition-all duration-200
                "
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="
                h-10 px-5 rounded-full
                bg-[oklch(0.45_0.13_155)] hover:bg-[oklch(0.40_0.13_155)]
                text-[oklch(0.97_0.01_85)]
                shadow-[0_2px_12px_-4px_oklch(0.45_0.13_155_/_0.4)]
                transition-all duration-200 disabled:opacity-60
              "
            >
              {loading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Search className="w-4 h-4" />
              }
            </Button>
          </form>
        </div>

        {/* Image grid */}
        <div className="overflow-y-auto flex-1 px-7 py-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[oklch(0.88_0.055_150)] flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-[oklch(0.45_0.13_155)]" />
              </div>
              <p className="text-sm text-[oklch(0.60_0.025_80)] font-light">Searching…</p>
            </div>
          ) : images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.map((image) => (
                <button
                  key={image.id}
                  onClick={() => onSelect(image.urls.regular)}
                  className="
                    group relative aspect-video overflow-hidden rounded-2xl
                    border-2 border-transparent
                    hover:border-[oklch(0.55_0.13_152)]
                    hover:shadow-[0_6px_20px_-6px_oklch(0.45_0.13_155_/_0.35)]
                    transition-all duration-200
                  "
                >
                  <Image
                    src={image.urls.small}
                    alt={image.description || "Unsplash image"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    width={400}
                    height={300}
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-[oklch(0.45_0.13_155_/_0)] group-hover:bg-[oklch(0.45_0.13_155_/_0.08)] transition-colors duration-200" />
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <div className="w-14 h-14 rounded-3xl bg-[oklch(0.92_0.022_85)] flex items-center justify-center text-2xl">
                🖼️
              </div>
              <p className="text-sm text-[oklch(0.60_0.025_80)] font-light text-center">
                Search for images to get started
              </p>
            </div>
          )}
        </div>

        {/* Footer credit */}
        <div className="px-7 py-3.5 border-t border-[oklch(0.90_0.020_85)] shrink-0">
          <p className="text-xs text-[oklch(0.65_0.025_80)] font-light">
            Photos from{" "}
            <a
              href="https://unsplash.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[oklch(0.45_0.13_155)] underline underline-offset-2 hover:text-[oklch(0.38_0.13_155)] transition-colors"
            >
              Unsplash
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}