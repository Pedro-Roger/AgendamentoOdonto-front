import React from "react";

type Service = {
  id: string;
  name: string;
  price: number;
};

type ServicesPageProps = {
  services: Service[];
};

export function ServicesPage({ services }: ServicesPageProps) {
  return (
    <section>
      <h1>Serviços</h1>
      <button type="button">Novo serviço</button>
      <ul>
        {services.map((service) => (
          <li key={service.id}>{service.name}</li>
        ))}
      </ul>
    </section>
  );
}
