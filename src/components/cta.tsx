import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";

export function CtaSection() {
  return (
    <section className="flex flex-col md:flex-row gap-8 justify-center items-center py-16">
      {/* Left: App Download */}
      <div className="bg-black text-white rounded-2xl p-10 flex-1 flex flex-col justify-center items-start max-w-xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Download the notes app of <br /> tomorrow today.
        </h2>
        <div className="flex gap-4 mb-8">
          <Button variant="secondary" className="flex items-center gap-2 bg-white text-black">
            <svg width="20" height="20" fill="currentColor" className="mr-2"><use xlinkHref="#apple" /></svg>
            Download for iOS
          </Button>
          <Button variant="outline" className="flex items-center gap-2 border-white text-white">
            <svg width="20" height="20" fill="currentColor" className="mr-2"><use xlinkHref="#play" /></svg>
            Download for Android
          </Button>
        </div>
        <img
          src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg"
          alt="App preview"
          className="w-64 mx-auto"
        />
      </div>

      {/* Right: Newsletter */}
      <div className="bg-gray-100 rounded-2xl p-10 flex-1 max-w-md">
        <h3 className="text-2xl font-bold mb-2">Subscribe to our weekly newsletter</h3>
        <p className="text-gray-600 mb-6">
          Lorem ipsum dolor sit amet consectetur adipiscing elit, mattis sit phasellus.
        </p>
        <form className="flex flex-col gap-4">
          <Input type="email" placeholder="Enter your email" className="bg-white" />
          <Button type="submit" className="w-full flex items-center justify-center gap-2">
            Subscribe <Mail className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </section>
  );
}