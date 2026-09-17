import { createFileRoute } from "@tanstack/react-router";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import WhyChoose from "@/components/Why-choose";
import { PublicLayout } from "@/components/layout/PublicLayout";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <PublicLayout bare>
      <Hero />
      <Categories />
      <WhyChoose />
    </PublicLayout>
  );
}
