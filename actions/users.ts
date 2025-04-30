"use server";
import { ResetPasswordEmail } from "@/components/email-templates/reset-password";
import { db } from "@/prisma/db";
import { InvitedUserProps, UserProps } from "@/types/types";
import bcrypt, { compare } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { PasswordProps } from "@/components/Forms/ChangePasswordForm";
import { Resend } from "resend";
import { generateToken } from "@/lib/token";
import { OrgData } from "@/components/Forms/RegisterForm";
import { generateOTP } from "@/lib/generateOTP";
import VerifyEmail from "@/components/email-templates/verify-email";
import { adminPermissions, userPermissions } from "@/config/permissions";
import { InviteData } from "@/components/Forms/users/UserInvitationForm";
import UserInvitation from "@/components/email-templates/user-invite";
import { generateApiKey } from "@/lib/generateAPIKey";
// import { generateNumericToken } from "@/lib/token";
const resend = new Resend(process.env.RESEND_API_KEY);
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

const DEFAULT_USER_ROLE = {
  displayName: "User",
  roleName: "user",
  description: "Default user role with basic permissions",
  permissions: userPermissions,
};
const ADMIN_USER_ROLE = {
  displayName: "Administrator",
  roleName: "admin",
  description: "Full system access",
  permissions: adminPermissions,
};

export async function createUser(data: UserProps, orgData: OrgData) {
  const { email, password, firstName, lastName, name, phone, image } = data;

  try {
    // Use a transaction for atomic operations
    return await db.$transaction(async (tx) => {
      // Check for existing users
      const existingUserByEmail = await tx.user.findUnique({
        where: { email },
      });

      const existingUserByPhone = await tx.user.findUnique({
        where: { phone },
      });

      if (existingUserByEmail) {
        return {
          error: `This email ${email} is already in use`,
          status: 409,
          data: null,
        };
      }

      if (existingUserByPhone) {
        return {
          error: `This Phone number ${phone} is already in use`,
          status: 409,
          data: null,
        };
      }

      // cREATE THE oTRGANISATION
      const existingOrganisation = await tx.organisation.findUnique({
        where: {
          slug: orgData.slug,
        },
      });
      if (existingOrganisation) {
        return {
          error: `Organisation Name ${orgData.name} is already taken`,
          status: 409,
          data: null,
        };
      }
      const org = await db.organisation.create({
        data: orgData,
      });

      // Create the Default API Key
      await db.apiKey.create({
        data: {
          name: "Default Key",
          key: generateApiKey(),
          orgId: org.id,
        },
      });

      // Find or create default admin role
      let defaultRole = await tx.role.findFirst({
        where: { roleName: ADMIN_USER_ROLE.roleName },
      });

      // Create default role if it doesn't exist
      if (!defaultRole) {
        defaultRole = await tx.role.create({
          data: {
            ...ADMIN_USER_ROLE,
            orgId: org.id,
          },
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      // Generate a 6-figure token

      const token = generateOTP();

      // Create user with role
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          name,
          orgId: org.id,
          orgName: org.name,
          phone,
          token,
          image,
          roles: {
            connect: {
              id: defaultRole.id,
            },
          },
        },
        include: {
          roles: true, // Include roles in the response
        },
      });
      // Send the Verification email
      const verificationCode = newUser.token ?? "";
      const { data, error } = await resend.emails.send({
        from: "Inventory Pro <info@desishub.com>",
        to: email,
        subject: "Verify your Account",
        react: VerifyEmail({ verificationCode }),
      });
      if (error) {
        console.log(error);
        return {
          error: `Something went wrong, Please try again`,
          status: 500,
          data: null,
        };
      }
      console.log(data);
      return {
        error: null,
        status: 200,
        data: { id: newUser.id, email: newUser.email },
      };
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return {
      error: `Something went wrong, Please try again`,
      status: 500,
      data: null,
    };
  }
}
export async function createInvitedUser(data: InvitedUserProps) {
  const {
    email,
    password,
    firstName,
    lastName,
    name,
    phone,
    image,
    orgId,
    roleId,
    orgName,
    locationId,
    locationName,
  } = data;

  try {
    // Use a transaction for atomic operations
    return await db.$transaction(async (tx) => {
      // Check for existing users
      const existingUserByEmail = await tx.user.findUnique({
        where: { email },
      });

      const existingUserByPhone = await tx.user.findUnique({
        where: { phone },
      });

      if (existingUserByEmail) {
        return {
          error: `This email ${email} is already in use`,
          status: 409,
          data: null,
        };
      }

      if (existingUserByPhone) {
        return {
          error: `This Phone number ${phone} is already in use`,
          status: 409,
          data: null,
        };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      // Create user with role
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          name,
          orgId: orgId,
          orgName: orgName,
          phone,
          image,
          locationId,
          locationName,
          isVerfied: true,
          roles: {
            connect: {
              id: roleId,
            },
          },
        },
      });
      // Update the status of the Invite
      await db.invite.update({
        where: {
          email,
        },
        data: {
          status: true,
        },
      });
      return {
        error: null,
        status: 200,
        data: { id: newUser.id, email: newUser.email },
      };
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return {
      error: `Something went wrong, Please try again`,
      status: 500,
      data: null,
    };
  }
}
export async function getAllMembers() {
  try {
    const members = await db.user.findMany({
      select: {
        id: true,
        name: true,
      },
    });
    return members;
  } catch (error) {
    console.error("Error fetching the count:", error);
    return 0;
  }
}
export async function getAllUsers() {
  try {
    const users = await db.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        roles: true,
      },
    });
    return users;
  } catch (error) {
    console.error("Error fetching the count:", error);
    return 0;
  }
}
export async function getOrgUsers(orgId: string) {
  try {
    const users = await db.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      where: {
        orgId,
      },
      include: {
        roles: true,
      },
    });
    return users;
  } catch (error) {
    console.error("Error fetching the count:", error);
    return 0;
  }
}
export async function getOrgInvites(orgId: string) {
  try {
    const users = await db.invite.findMany({
      orderBy: {
        createdAt: "desc",
      },
      where: {
        orgId,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        status: true,
      },
    });
    return users;
  } catch (error) {
    console.error("Error fetching the count:", error);
    return 0;
  }
}

export async function deleteUser(id: string) {
  try {
    const user = await db.user.findUnique({
      where: {
        id,
      },
      select: {
        email: true,
      },
    });
    await db.invite.delete({
      where: {
        email: user?.email,
      },
    });
    const deleted = await db.user.delete({
      where: {
        id,
      },
    });
    revalidatePath("/dashboard/settings/users");
    return {
      ok: true,
      data: deleted,
    };
  } catch (error) {
    console.log(error);
  }
}

export async function getUserById(id: string) {
  try {
    const user = await db.user.findUnique({
      where: {
        id,
      },
    });
    return user;
  } catch (error) {
    console.log(error);
  }
}
export async function sendResetLink(email: string) {
  try {
    const user = await db.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      return {
        status: 404,
        error: "We cannot associate this email with any user",
        data: null,
      };
    }
    const token = generateToken();
    const update = await db.user.update({
      where: {
        email,
      },
      data: {
        token,
      },
    });
    const userFirstname = user.firstName;

    const resetPasswordLink = `${baseUrl}/reset-password?token=${token}&&email=${email}`;
    const { data, error } = await resend.emails.send({
      from: "NextAdmin <info@desishub.com>",
      to: email,
      subject: "Reset Password Request",
      react: ResetPasswordEmail({ userFirstname, resetPasswordLink }),
    });
    if (error) {
      return {
        status: 404,
        error: error.message,
        data: null,
      };
    }
    console.log(data);
    return {
      status: 200,
      error: null,
      data: data,
    };
  } catch (error) {
    console.log(error);
    return {
      status: 500,
      error: "We cannot find your email",
      data: null,
    };
  }
}

export async function updateUserPassword(id: string, data: PasswordProps) {
  const existingUser = await db.user.findUnique({
    where: {
      id,
    },
  });
  // Check if the Old Passw = User Pass
  let passwordMatch: boolean = false;
  //Check if Password is correct
  if (existingUser && existingUser.password) {
    // if user exists and password exists
    passwordMatch = await compare(data.oldPassword, existingUser.password);
  }
  if (!passwordMatch) {
    return { error: "Old Password Incorrect", status: 403 };
  }
  const hashedPassword = await bcrypt.hash(data.newPassword, 10);
  try {
    const updatedUser = await db.user.update({
      where: {
        id,
      },
      data: {
        password: hashedPassword,
      },
    });
    revalidatePath("/dashboard/clients");
    return { error: null, status: 200 };
  } catch (error) {
    console.log(error);
  }
}
export async function resetUserPassword(
  email: string,
  token: string,
  newPassword: string
) {
  const user = await db.user.findUnique({
    where: {
      email,
      token,
    },
  });
  if (!user) {
    return {
      status: 404,
      error: "Please use a valid reset link",
      data: null,
    };
  }
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  try {
    const updatedUser = await db.user.update({
      where: {
        email,
        token,
      },
      data: {
        password: hashedPassword,
      },
    });
    return {
      status: 200,
      error: null,
      data: null,
    };
  } catch (error) {
    console.log(error);
  }
}

export async function verifyOTP(userId: string, otp: string) {
  try {
    const user = await db.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (user?.token !== otp) {
      return {
        status: 403,
      };
    }
    const update = await db.user.update({
      where: {
        id: userId,
      },
      data: {
        isVerfied: true,
      },
    });
    return {
      status: 200,
    };
  } catch (error) {
    return {
      status: 403,
    };
  }
}
export async function getCurrentUsersCount() {
  try {
    const count = await db.user.count();
    return count;
  } catch (error) {
    console.log(error);
    return 0;
  }
}

export async function sendInvite(data: InviteData) {
  const { email, orgId, orgName, roleId, roleName, locationId, locationName } =
    data;

  try {
    // Check for existing users
    const existingUserByEmail = await db.user.findUnique({
      where: { email },
    });

    if (existingUserByEmail) {
      return {
        error: `This email ${email} is already in use`,
        status: 409,
        data: null,
      };
    }
    // Check if already invited
    const existingInvite = await db.invite.findFirst({
      where: { email },
    });
    if (existingInvite) {
      return {
        error: `This User ${email} is already Invited`,
        status: 409,
        data: null,
      };
    }
    // Create the Invite
    await db.invite.create({
      data: {
        email,
        orgId,
      },
    });
    // Send the Verification email
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const linkUrl = `${baseUrl}/user-invite/${orgId}?roleId=${roleId}&&email=${email}&&orgName=${orgName}&locationId=${locationId}&locationName=${locationName}`;
    const { data, error } = await resend.emails.send({
      from: "Inventory Pro <info@desishub.com>",
      to: email,
      subject: `Welcome to ${orgName} - ${roleName} Role Invitation`,
      react: UserInvitation({ orgName, roleName, linkUrl }),
    });
    if (error) {
      console.log(error);
      return {
        error: `Something went wrong, Please try again`,
        status: 500,
        data: null,
      };
    }
    console.log(data);
    revalidatePath("/dashboard/users");
    return {
      error: null,
      status: 200,
      data,
    };
  } catch (error) {
    console.error("Error creating user:", error);
    return {
      error: `Something went wrong, Please try again`,
      status: 500,
      data: null,
    };
  }
}
