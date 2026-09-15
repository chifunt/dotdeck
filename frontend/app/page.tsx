"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios-instance";
import type { Paging, Tag as TagType } from "@/types";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedButton } from "@/components/ui/animated-button";
import Image from "next/image";
import {
  Search,
  Filter,
  ThumbsUp,
  ThumbsDown,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDebounce } from "@/hooks/use-debounce";
import { getImageUrl } from "@/lib/get-image-url";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 16;

const fetchDecks = async (params: {
  q?: string;
  tag?: string;
  limit?: number;
  offset?: number;
}): Promise<Paging<any>> => {
  const response = await api.get("/decks", { params });
  if (
    response.data &&
    Array.isArray(response.data.data) &&
    response.data.paging
  ) {
    return response.data;
  }
  console.warn("Unexpected response structure for /decks:", response.data);
  return {
    data: [],
    paging: {
      limit: params.limit || ITEMS_PER_PAGE,
      offset: params.offset || 0,
      total: 0,
    },
  };
};

const fetchTags = async (): Promise<TagType[]> => {
  const response = await api.get("/tags", { params: { all: 1 } });
  if (Array.isArray(response.data)) {
    return response.data;
  }
  if (response.data && Array.isArray(response.data.data)) {
    return response.data.data;
  }
  console.warn(
    "Unexpected response structure for /tags, expected an array or { data: array }.",
    response.data,
  );
  return [];
};

function DeckCard({ deck, index }: { deck: any; index: number }) {
  const thumbnailUrl = deck.thumbnail_url || deck.thumbnailUrl;
  const authorName = deck.username || deck.author?.username || "Unknown Author";
  const deckTags = deck.tags || [];
  const maxTagsToShow = 3;

  return (
    <Link
      href={`/decks/${deck.slug}`}
      className={cn("stagger-item block", `delay-${index * 100}`)}
      replace
    >
      <Card
        className="flex flex-col h-[400px] hover-lift group transition-all duration-300 hover:border-primary/50 relative overflow-hidden"
      >
        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-rose/5 via-foam/5 to-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Navigation hint */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 z-20">
          <div className="bg-background/90 backdrop-blur-sm rounded-full p-1.5 shadow-lg border">
            <ExternalLink className="h-3 w-3 text-primary" />
          </div>
        </div>

        <CardHeader className="p-0 flex-shrink-0">
          {thumbnailUrl ? (
            <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
              <Image
                src={getImageUrl(thumbnailUrl) || "/placeholder.svg"}
                alt={deck.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
                crossOrigin="anonymous"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ) : (
            <div className="aspect-video w-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center rounded-t-lg group-hover:from-primary/10 group-hover:to-accent/10 transition-all duration-300">
              <Settings className="h-12 w-12 text-muted-foreground group-hover:text-primary transition-all duration-300 animate-float group-hover:scale-110" />
            </div>
          )}
        </CardHeader>

        <CardContent className="flex-grow p-4 flex flex-col min-h-0 relative z-10">
          <CardTitle className="mb-2 group-hover:text-primary transition-all duration-300 line-clamp-2 text-lg leading-tight group-hover:scale-[1.02] transform-gpu">
            {deck.title}
          </CardTitle>
          <CardDescription className="group-hover:text-foreground/80 transition-colors duration-200 text-sm leading-relaxed line-clamp-2 flex-shrink-0 mb-3">
            {deck.description || "No description available."}
          </CardDescription>

          {deckTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-auto flex-shrink-0">
              {deckTags.slice(0, maxTagsToShow).map((tag: any, i: number) => (
                <Badge
                  key={tag.id || tag.name || i}
                  variant="secondary"
                  className="hover-scale transition-all duration-300 hover:bg-primary/20 text-xs px-2 py-0.5 group-hover:shadow-md group-hover:border-primary/30"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  {tag.name || tag}
                </Badge>
              ))}
              {deckTags.length > maxTagsToShow && (
                <Badge
                  variant="outline"
                  className="text-xs px-2 py-0.5 group-hover:border-primary/50 transition-all duration-300"
                >
                  +{deckTags.length - maxTagsToShow}
                </Badge>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between items-center text-sm text-muted-foreground border-t pt-4 bg-muted/20 group-hover:bg-primary/5 transition-all duration-300 flex-shrink-0 h-16 relative z-10">
          <div className="flex items-center group-hover:text-primary transition-colors duration-200 min-w-0 flex-1">
            <User className="h-4 w-4 mr-1 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
            <span className="font-medium truncate">{authorName}</span>
          </div>
          <div className="flex items-center space-x-3 flex-shrink-0">
            <div className="flex items-center hover-scale group-hover:scale-105 transition-transform duration-200">
              <ThumbsUp className="h-4 w-4 mr-1 text-green-600 group-hover:text-green-500" />
              <span className="group-hover:font-semibold transition-all duration-200">
                {deck.likes || deck.upvotes || 0}
              </span>
            </div>
            <div className="flex items-center hover-scale group-hover:scale-105 transition-transform duration-200">
              <ThumbsDown className="h-4 w-4 mr-1 text-red-500 group-hover:text-red-400" />
              <span className="group-hover:font-semibold transition-all duration-200">
                {deck.dislikes || deck.downvotes || 0}
              </span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}

function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  isLoading,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}) {
  const getVisiblePages = () => {
    const delta = 2;
    const range: (number | string)[] = [];
    const rangeWithDots: (number | string)[] = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center space-x-2 mt-8 animate-fade-in">
      <AnimatedButton
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || isLoading}
        className="flex items-center"
        animation="scale"
      >
        <ChevronLeft className="h-4 w-4" />
      </AnimatedButton>

      <div className="flex items-center space-x-1">
        {getVisiblePages().map((page, idx) => (
          <div key={idx}>
            {page === "..." ? (
              <span className="px-3 py-2 text-muted-foreground animate-pulse">
                ...
              </span>
            ) : (
              <AnimatedButton
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page as number)}
                disabled={isLoading}
                className={cn(
                  "min-w-[40px]",
                  currentPage === page && "animate-glow",
                )}
                animation="scale"
              >
                {page}
              </AnimatedButton>
            )}
          </div>
        ))}
      </div>

      <AnimatedButton
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || isLoading}
        className="flex items-center"
        animation="scale"
      >
        <ChevronRight className="h-4 w-4" />
      </AnimatedButton>
    </div>
  );
}

function AnimatedSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-shimmer bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200px_100%] rounded",
        className,
      )}
    />
  );
}

export const SearchContext = React.createContext<{
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  handleSearch: () => void;
  isLoading: boolean;
}>({
  searchTerm: "",
  setSearchTerm: () => {},
  selectedTags: [],
  setSelectedTags: () => {},
  handleSearch: () => {},
  isLoading: false,
});

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["decks"] });
    queryClient.invalidateQueries({ queryKey: ["tags"] });
  }, [queryClient]);

  useEffect(() => {
    const onVis = () => {
      if (!document.hidden) {
        queryClient.invalidateQueries({ queryKey: ["decks"] });
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [queryClient]);

  const {
    data: decksData,
    isLoading: isLoadingDecks,
    error: decksError,
    isFetching: isFetchingDecks,
  } = useQuery<Paging<any>, Error>({
    queryKey: ["decks", debouncedSearchTerm, selectedTags, currentPage],
    queryFn: () =>
      fetchDecks({
        q: debouncedSearchTerm || undefined,
        tag: selectedTags.length ? selectedTags.join(",") : undefined,
        limit: ITEMS_PER_PAGE,
        offset: (currentPage - 1) * ITEMS_PER_PAGE,
      }),
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const { data: allTags, isLoading: isLoadingTags } = useQuery<
    TagType[],
    Error
  >({
    queryKey: ["tags"],
    queryFn: fetchTags,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: true,
  });

  const randomTags = useMemo(() => {
    if (!allTags) return [];
    return [...allTags].sort(() => 0.5 - Math.random()).slice(0, 5);
  }, [allTags]);

  const totalPages = Math.ceil((decksData?.paging.total || 0) / ITEMS_PER_PAGE);

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
    setCurrentPage(1);
  };

  const handlePageChange = (p: number) => {
    setCurrentPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearch = () => {
    setCurrentPage(1);
    queryClient.invalidateQueries({
      queryKey: ["decks", debouncedSearchTerm, selectedTags, 1],
    });
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedTags]);

  const searchContextValue = {
    searchTerm,
    setSearchTerm,
    selectedTags,
    setSelectedTags: (tags: string[]) => {
      setSelectedTags(tags);
      setCurrentPage(1);
    },
    handleSearch,
    isLoading: isLoadingDecks,
  };

  return (
    <SearchContext.Provider value={searchContextValue}>
      <div className="space-y-8">
        {isFetchingDecks && !isLoadingDecks && (
          <div className="fixed top-20 right-4 z-50 animate-slide-down">
            <div className="bg-primary/10 border border-primary/20 rounded-lg px-3 py-2 flex items-center space-x-2 backdrop-blur-sm">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-primary font-medium">
                Refreshing...
              </span>
            </div>
          </div>
        )}

        {/* Search & filters */}
        <div className="bg-card p-6 rounded-lg shadow-lg space-y-4 bg-gradient-to-br from-rose/5 via-foam/5 to-gold/5 border border-rose/20 animate-slide-down">
          <div className="flex flex-row space-x-3 items-center">
            <div className="relative flex-grow min-w-0">
              <Input
                type="search"
                placeholder="Search decks, e.g., 'neovim theme' or 'zsh alias'"
                className="h-12 text-base lg:text-lg focus-ring-foam hover:border-foam/50 transition-all duration-200 pr-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Sparkles className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 lg:h-5 lg:w-5 text-gold animate-pulse" />
            </div>
            <div className="flex space-x-3">
              <Sheet>
                <SheetTrigger asChild>
                  <AnimatedButton
                    variant="outline"
                    size="default"
                    className="h-12 px-4 border-foam/30 hover:bg-foam/10 hover:border-foam/50 flex items-center justify-center w-24"
                    animation="glow"
                  >
                    <Filter className="mr-2 h-4 w-4 text-foam" />
                    <span>Filters</span>
                  </AnimatedButton>
                </SheetTrigger>
                <SheetContent className="animate-slide-up">
                  <SheetHeader>
                    <SheetTitle className="gradient-text">
                      Filter by Tags
                    </SheetTitle>
                  </SheetHeader>
                  <ScrollArea className="h-[calc(100vh-150px)] mt-4">
                    <div className="space-y-2">
                      {isLoadingTags &&
                        Array.from({ length: 10 }).map((_, i) => (
                          <AnimatedSkeleton key={i} className="h-8 w-full" />
                        ))}
                      {allTags?.map((tag, i) => (
                        <div
                          key={tag.id}
                          className={cn(
                            "flex items-center space-x-2 stagger-item",
                            `delay-${i * 50}`,
                          )}
                        >
                          <Checkbox
                            id={`tag-${tag.id}`}
                            checked={selectedTags.includes(tag.name)}
                            onCheckedChange={() => handleTagToggle(tag.name)}
                            className="hover-scale"
                          />
                          <Label
                            htmlFor={`tag-${tag.id}`}
                            className="cursor-pointer hover:text-primary transition-colors"
                          >
                            {tag.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </SheetContent>
              </Sheet>
              <AnimatedButton
                size="default"
                className="h-12 px-4 bg-rose hover:bg-rose/90 text-white flex items-center justify-center w-24"
                onClick={handleSearch}
                animation="bounce"
                loading={isLoadingDecks}
              >
                <Search className="mr-2 h-4 w-4" />
                <span>Search</span>
              </AnimatedButton>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 h-auto lg:h-[1.5rem] items-center">
            <span className="text-sm text-muted-foreground mr-2 animate-fade-in">
              Popular tags:
            </span>
            {isLoadingTags &&
              Array.from({ length: 5 }).map((_, i) => (
                <AnimatedSkeleton key={i} className="h-6 w-20 rounded-full" />
              ))}
            {randomTags.map((tag, i) => (
              <Badge
                key={tag.id}
                variant={
                  selectedTags.includes(tag.name) ? "default" : "outline"
                }
                onClick={() => handleTagToggle(tag.name)}
                className={cn(
                  "cursor-pointer hover-scale transition-all duration-200 stagger-item hover:shadow-md",
                  "hover:bg-foam/20 hover:border-foam/50 hover:text-foam",
                  selectedTags.includes(tag.name) &&
                    "bg-rose text-white border-rose shadow-lg shadow-rose/25",
                  `delay-${i * 100}`,
                )}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Deck grid */}
        <section className="animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-rose via-foam to-gold bg-clip-text text-transparent">
              Explore Decks
            </h2>
            {decksData?.paging && (
              <div className="text-sm text-muted-foreground animate-slide-up">
                Showing {Math.min(ITEMS_PER_PAGE, decksData.data.length)} of{" "}
                {decksData.paging.total} decks
                {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
                {isFetchingDecks && (
                  <span className="ml-2 text-primary">
                    <span className="animate-pulse">•</span> Updating
                  </span>
                )}
              </div>
            )}
          </div>

          {isLoadingDecks && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                <Card key={i} className="stagger-item h-[400px]">
                  <CardHeader className="p-0">
                    <AnimatedSkeleton className="aspect-video w-full rounded-t-lg" />
                  </CardHeader>
                  <CardContent className="p-4">
                    <AnimatedSkeleton className="h-6 w-3/4 mb-2" />
                    <AnimatedSkeleton className="h-4 w-full mb-1" />
                    <AnimatedSkeleton className="h-4 w-1/2 mb-3" />
                    <div className="flex gap-2">
                      <AnimatedSkeleton className="h-6 w-16 rounded-full" />
                      <AnimatedSkeleton className="h-6 w-20 rounded-full" />
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    <AnimatedSkeleton className="h-4 w-1/3" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {decksError && (
            <div className="text-center py-8 animate-fade-in">
              <p className="text-destructive">
                Error loading decks: {decksError.message}
              </p>
            </div>
          )}

          {decksData?.data.length === 0 && !isLoadingDecks && !decksError && (
            <div className="text-center py-12 animate-fade-in">
              <Settings className="h-16 w-16 text-muted-foreground mx-auto mb-4 animate-float" />
              <p className="text-lg text-muted-foreground">
                No decks found. Try adjusting your search or filters.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {decksData?.data.map((deck, idx) => (
              <DeckCard key={deck.id} deck={deck} index={idx} />
            ))}
          </div>

          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            isLoading={isLoadingDecks}
          />
        </section>
      </div>
    </SearchContext.Provider>
  );
}
