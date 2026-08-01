import { prisma } from "../prisma";

export async function hasPermission(
  userId: number,
  permission: string,
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: {
        select: {
          rolePermissions: {
            select: {
              permission: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
      userPermissions: {
        where: {
          permission: {
            name: permission,
          },
        },
        select: {
          granted: true,
          permission: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!user) return false;

  if (user.userPermissions.length > 0) {
    return user.userPermissions[0].granted;
  }

  return (
    user.role?.rolePermissions.some(
      (rp) => rp.permission.name === permission,
    ) ?? false
  );
}
