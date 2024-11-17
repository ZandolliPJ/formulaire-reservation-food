import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/app/lib/db";
import { Resend } from "resend";
import EmailTemplate from "@/app/components/EmailTemplate";
import { ReactElement } from "react";
import { render } from "@react-email/render";

export async function POST(request: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      numPeople,
      arrivalTime,
      reservationDate,
    } = await request.json();

    // Créer la réservation
    const reservation = await prisma.reservation.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        numPeople,
        arrivalTime,
        reservationDate: new Date(reservationDate),
      },
    });

    // Générer le HTML de l'email
    const emailHtml = await render(
      EmailTemplate({
        firstName,
        lastName,
        email,
        phone,
        numPeople,
        arrivalTime,
        reservationDate,
      }) as ReactElement
    );

    // Envoi du mail
    await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: ["judithpascal07@gmail.com"],
      subject: "Nouvelle Réservation",
      html: emailHtml,
    });

    return NextResponse.json(
      { message: "Réservation effectuée avec succès !", reservation },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur lors de la création de la réservation:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la réservation" },
      { status: 500 }
    );
  }
}
