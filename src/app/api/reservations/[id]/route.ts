import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  if (!reservation) {
    return NextResponse.json(
      { error: "Réservation non trouvée" },
      { status: 404 }
    );
  }

  if (reservation.userId !== session.user.id) {
    return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
  }

  return NextResponse.json(reservation);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;

  const reservation = await prisma.reservation.findUnique({
    where: { id },
  });

  if (!reservation) {
    return NextResponse.json(
      { error: "Réservation non trouvée" },
      { status: 404 }
    );
  }

  if (reservation.userId !== session.user.id) {
    return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
  }

  await prisma.reservation.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
