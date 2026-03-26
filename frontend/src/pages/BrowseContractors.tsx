import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ContractorCard } from "@/components/ContractorCard";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal } from "lucide-react";
import { apiClient } from "@/services/api";

interface ApiContractor {
  _id: string;
  company?: string;
  specialties?: string[];
  bio?: string;
  experience?: number;
  rating?: number;
  totalProjects?: number;
  hourlyRate?: number;
  isVerified?: boolean;
  userId?: {
    name?: string;
    location?: string;
  };
}

const BrowseContractors = () => {
  const [search, setSearch] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [contractors, setContractors] = useState<ApiContractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContractors = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.get<{
          contractors: ApiContractor[];
        }>("/contractors");
        setContractors(Array.isArray(data.contractors) ? data.contractors : []);
      } catch (requestError) {
        setError("Unable to load contractors right now.");
      } finally {
        setLoading(false);
      }
    };

    void loadContractors();
  }, []);

  const contractorCards = useMemo(
    () =>
      contractors.map((contractor) => ({
        id: contractor._id,
        businessName: contractor.company || contractor.userId?.name || "Unnamed contractor",
        location: contractor.userId?.location || "Location unavailable",
        yearsExperience: contractor.experience || 0,
        bio: contractor.bio || "No company bio available yet.",
        specialties: contractor.specialties || [],
        rating: contractor.rating || 0,
        reviewCount: contractor.totalProjects || 0,
        completedProjects: contractor.totalProjects || 0,
        verified: contractor.isVerified,
      })),
    [contractors]
  );

  const allSpecialties = Array.from(new Set(contractorCards.flatMap((contractor) => contractor.specialties)));

  const filtered = contractorCards.filter((contractor) => {
    const normalizedSearch = search.toLowerCase();
    const matchSearch =
      !search ||
      contractor.businessName.toLowerCase().includes(normalizedSearch) ||
      contractor.location.toLowerCase().includes(normalizedSearch);
    const matchSpec = !selectedSpecialty || contractor.specialties.includes(selectedSpecialty);
    return matchSearch && matchSpec;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 lg:py-12">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">Find Contractors</h1>
            <p className="mt-1 text-muted-foreground">Browse verified professionals in your area</p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by name or location..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
        </div>

        {/* Specialty filters */}
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedSpecialty(null)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${!selectedSpecialty ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
          >
            All
          </button>
          {allSpecialties.map(s => (
            <button
              key={s}
              onClick={() => setSelectedSpecialty(selectedSpecialty === s ? null : s)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selectedSpecialty === s ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Results */}
        {error && <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

        {loading ? (
          <div className="mt-12 text-center text-muted-foreground">Loading contractors...</div>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((contractor) => (
              <ContractorCard key={contractor.id} contractor={contractor} />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="mt-12 text-center text-muted-foreground">
            <SlidersHorizontal className="mx-auto h-10 w-10 text-muted" />
            <p className="mt-3">No contractors match your search.</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default BrowseContractors;
