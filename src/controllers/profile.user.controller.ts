import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();


export const getSingleUserInfo = async (req: Request, res: Response):Promise<any>=> {
    try {
        const { id } = req.params
        console.log(req.params,'profile');
        
        if (!id) {
            return res.status(404).json({ message: 'Not found id' })
        }

        const user = await prisma.user.findUnique({ where: { id } })

        if (!user) {
            return res.status(404).json({ message: 'Not found user' })
        }

        res.json({
            message: 'user found successfully',
            user: {
                name: user?.name,
                email: user?.email,
                role: user?.role,
                image: user?.image,
                address: user?.address,
                district: user?.district,
                division: user?.division,
                thana: user?.thana,
                union: user?.union,
                postCode: user?.postCode
            }



        })
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: 'forgotten id' });
    }
}